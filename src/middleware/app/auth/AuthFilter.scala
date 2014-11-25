package auth

import play.api.libs.iteratee.Iteratee
import play.api.mvc._
import play.api.{Logger, Play}
import utils.HashUtils

object AuthFilter extends EssentialFilter {

  def apply(nextFilter: EssentialAction) = new EssentialAction {
    def apply(v1: RequestHeader) = {
      if (v1.path == "/" || v1.path == "/ping") nextFilter(v1)
      else {
        val tsName = Play.current.configuration.getString("auth.header.ts").get
        val tokenName = Play.current.configuration.getString("auth.header.token").get

        val headerMap = v1.headers.toSimpleMap
        val tsHeader = headerMap.find(_._1 == tsName)
        val tokenHeader = headerMap.find(_._1 == tokenName)
        if (tsHeader.isEmpty || tokenHeader.isEmpty) {
          val env = Play.current.configuration.getString("deployment.env")
          if (!env.isEmpty && env.get == "dev") {
            Logger.info("In development environment! Ignore the security auth checking")
            nextFilter(v1)
          } else {
            val msg = "Missing parameters: " + tsHeader + ", " + tokenName
            Logger.info(msg)
            Iteratee.ignore[Array[Byte]].map(_=>
              Results.Unauthorized(msg)
            )
          }
        } else {
          val key = Play.current.configuration.getString("auth.privateKey").getOrElse((""))
          if (!key.isEmpty) {
            val expectedToken = HashUtils.genToken(tsHeader.get._2.toLowerCase, key)
            if (expectedToken == tokenHeader.get._2) {
              nextFilter(v1)
            } else {
              val msg = "Token is incorrect"
              Logger.info(msg)
              Iteratee.ignore[Array[Byte]].map(_=>Results.Unauthorized(msg))
            }
          } else {
            val msg = "Missing private key"
            Logger.info(msg)
            Iteratee.ignore[Array[Byte]].map(_=>Results.Unauthorized(msg))
          }
        }
      }
    }
  }

}