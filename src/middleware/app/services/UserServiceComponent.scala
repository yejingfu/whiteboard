package services

import model._
import services.ServerResponse

trait UserServiceComponent {

  val userService: UserService

  trait UserService {
    def register(dto: AddUserDTO): ServerResponse[SessionDTO]
    def login(dto: LoginDTO): ServerResponse[SessionDTO]
    def logout(dto: LogoutDTO): ServerResponse[Boolean]
    def getSession(dto: GetSessionDTO): ServerResponse[SessionDTO]
    def touchSession(dto: TouchSessionDTO): ServerResponse[Boolean]
  }

}
