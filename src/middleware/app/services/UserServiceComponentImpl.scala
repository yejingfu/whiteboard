package services

import model._
import services.ServerResponse

import scala.concurrent.Future

trait UserServiceComponentImpl extends UserServiceComponent {

  val userService: UserService = new UserServiceImpl

  class UserServiceImpl extends UserService {

    def register(dto: AddUserDTO): ServerResponse[SessionDTO] = {
      dto.validate match {
        case None => try {

        } catch {
          case e: Throwable => Future(ErrorDTOEnum.RegisterFailed).asInstanceOf[ServerResponse[SessionDTO]]
        }
      }
    }

    def login(dto: LoginDTO): ServerResponse[SessionDTO] = {

    }

    def logout(dto: LogoutDTO): ServerResponse[Boolean] = {

    }

    def getSession(dto: GetSessionDTO): ServerResponse[SessionDTO] = {

    }

    def touchSession(dto: TouchSessionDTO): ServerResponse[Boolean] = {

    }

  }
}
