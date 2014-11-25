package controllers

import play.api._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits._

import scala.concurrent.Future


class UserController extends Controller {

  def register = Action.async { request =>
    Future(Ok("Not implemented"))
  }

  def getUser(uid : String) = Action.async { request =>
    Future(NotImplemented("not implemented : getuser--" + uid))
  }

  def login = Action.async { request =>
    Future(NotImplemented("login not implemented"))
  }

  def logout = Action.async { request =>
    Future(NotImplemented("logout not implemented"))
  }

  def getSession = Action.async { request =>
    Future(NotImplemented("getSession not implemented"))
  }

  def touchSession = Action.async { request =>
    Future(NotImplemented("touchSession not implemented"))
  }

}
