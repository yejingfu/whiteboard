import java.util

import controllers.UserController
import play.api.{Logger, Application}
import play.api.mvc.{RequestHeader, WithFilters}
import play.api.mvc.Results.BadRequest
import auth._

import scala.concurrent.Future

object Global extends WithFilters(AuthFilter) {
  override def onStart(app: Application) {
    Logger.info(">>Application is launched ...")
  }

  override def onStop(app: Application) {
    Logger.info(">>Application is stopped ...")
  }

  override def getControllerInstance[A](clazz: Class[A]) = clazz match {
    case c if c.isAssignableFrom(classOf[UserController]) => {
      Logger.info(">>getControllerInstance")
      new UserController().asInstanceOf[A]
    }
    case _ =>
      super.getControllerInstance(clazz)
  }

  override def onBadRequest(req: RequestHeader, err: String) = {
    Logger.info(">>onBadRequest")
    Future.successful(BadRequest("Bad request: " + err))
  }

  override def onError(req: RequestHeader, ex: Throwable) = {
    Logger.info(">>onError")
    Future.successful(BadRequest("error happened : " + ex.getMessage))
  }
}
