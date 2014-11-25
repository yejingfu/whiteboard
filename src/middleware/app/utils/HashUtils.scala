package utils

import java.security.MessageDigest
import java.util.Date

object HashUtils {

  def sha256(src: String): String = {
    val md = MessageDigest.getInstance("SHA-256")
    md.reset()
    md.update(src.getBytes("UTF-8"))
    bytes2Hex(md.digest())
  }

  def bytes2Hex(bytes: Array[Byte]): String = {
    val sb = new StringBuilder
    for (b <- bytes) {
      val tmp = Integer.toHexString(b & 0xFF)
      if (tmp.length == 1) sb.append("0")
      sb.append(tmp)
    }
    sb.toString
  }

  def genToken(ts: String, key: String): String = sha256(ts + key)

  def genID() = java.util.UUID.randomUUID().toString

  def currentTime = new Date().getTime
}
