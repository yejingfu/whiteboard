package model

import play.api.libs.json._
import utils.EmailUtils

trait Validator {
  def validate[T]: Option[BaseResponseDTO[T]] = None
}

sealed abstract class BaseResponseDTO[T] {
  def isError: Boolean
}

/**
 * The response wrapper of real DTO object
 * @param dto The real dto object
 * @tparam T
 */
case class ResponseDTO[T](dto: T) extends BaseResponseDTO[T] {
  def isError = false
  def get = dto
}

case class ErrorDTO[T](errCode: Int = -1, message: String = "") extends BaseResponseDTO[T] {
  def isError = true
  def getMessage = errCode.toString + "--" + message
}


object ErrorDTOEnum extends Enumeration {
  val Success = ErrorDTO(0, "Success")
  val GeneralError = ErrorDTO(1, "Unknown error")
  val InvalidInput = ErrorDTO(2, "Invalid input")
  val Forbidden = ErrorDTO(3, "Forbidden access")

  val InvalidEmail = ErrorDTO(20, "Invalid email")
  val InvalidPasswd = ErrorDTO(21, "Invalid password")
  val EmailAlreadyExist = ErrorDTO(22, "Email already exists")
  val UserNotFound = ErrorDTO(23, "User not found")
  val LoginFailed = ErrorDTO(24, "Login failed")
  val UserIDEmpty = ErrorDTO(25, "User ID is empty")
  val RegisterFailed = ErrorDTO(26, "Register failed")

  val SessionIDEmpty = ErrorDTO(40, "Session ID is empty")
  val SessionNotExist = ErrorDTO(41, "Session not exists")
  val AddSessionFailed = ErrorDTO(42, "Failed to add session")
  val TouchSessionFailed = ErrorDTO(43, "Failed to touch session")
  val ExpireSessionFailed = ErrorDTO(44, "Failed to expire session")
  val NotAuthenticated = ErrorDTO(45, "Not authenticated")

  val GeneralDBError = ErrorDTO(46, "Data base error")
}

case class AddUserDTO(username: String, email: String, passwd: String) extends Validator {
  override def validate[T] = {
    if (!EmailUtils.isValidateFormat(email))
      Some(ErrorDTOEnum.InvalidEmail.asInstanceOf[BaseResponseDTO[T]])
    else
      None
  }
}

case class GetUserDTO(uid: String) extends Validator {
  override  def validate[T] = {
    if (uid.isEmpty) Some(ErrorDTOEnum.UserNotFound.asInstanceOf[BaseResponseDTO[T]])
    else None
  }
}

case class LoginDTO(email: String, passwd: String) extends Validator {
  override def validate[T] = {
    if (!EmailUtils.isValidateFormat(email)) Some(ErrorDTOEnum.InvalidEmail.asInstanceOf[BaseResponseDTO[T]])
    else None
  }
}

case class LogoutDTO(sid: String) extends Validator {
  override def validate[T] = {
    if (sid.isEmpty) Some(ErrorDTOEnum.SessionIDEmpty.asInstanceOf[BaseResponseDTO[T]])
    else None
  }
}

case class SessionDTO(sid: String, uid: String, logints: Long, updatets: Long, logoutts: Long) extends Validator {
  override def validate[T] = {
    if (logoutts > 0) Some(ErrorDTOEnum.SessionNotExist.asInstanceOf[BaseResponseDTO[T]])
    else None
  }
}

case class AddSessionDTO(uid: String) extends Validator {
  override def validate[T] = {
    if (uid.isEmpty) Some(ErrorDTOEnum.UserNotFound.asInstanceOf[BaseResponseDTO[T]])
    else None
  }
}

case class GetSessionDTO(sid: String) extends Validator {
  override def validate[T] = {
    if (sid.isEmpty) Some(ErrorDTOEnum.SessionIDEmpty.asInstanceOf[BaseResponseDTO[T]])
    else None
  }
}

case class TouchSessionDTO(sid: String) extends Validator {
  override def validate[T] = {
    if (sid.isEmpty) Some(ErrorDTOEnum.SessionIDEmpty.asInstanceOf[BaseResponseDTO[T]])
    else None
  }
}

case class ExpireSessionDTO(sid: String) extends  Validator {
  override def validate[T] = {
    if (sid.isEmpty) Some(ErrorDTOEnum.SessionIDEmpty.asInstanceOf[BaseResponseDTO[T]])
    else None
  }
}

trait DTOFormats {
  implicit def baseResponseDTO[T](implicit fmt: Writes[T]) = new Format[BaseResponseDTO[T]] {
    def reads(json: JsValue): JsResult[BaseResponseDTO[T]] = {null}
    def writes(item: BaseResponseDTO[T]): JsValue = {
      item match {
        case ErrorDTO(code, msg) => {
          Json.obj("errCode"->code, "message" -> msg)
        }
        case ResponseDTO(dto) => {
          else Json.toJson[T](dto)
        }
        case _ => {
          Json.obj("errCode" -> 1, "message" -> "unknown error")
        }
      }
    }
  }

  implicit val addUserDTOFormat = Json.format[AddUserDTO]
  implicit val getUserDTOFormat = Json.format[GetUserDTO]
  implicit val loginDTOFormat = Json.format[LoginDTO]
  implicit val logoutDTOFormat = Json.format[LogoutDTO]
  implicit val sessionDTOFormat = Json.format[SessionDTO]
  implicit val addSessionDTOFormat = Json.format[AddSessionDTO]
  implicit val getSessionDTOFormat = Json.format[GetSessionDTO]
  implicit val touchSessionDTOFormat = Json.format[TouchSessionDTO]
  implicit val expireSessionDTOFormat = Json.format[ExpireSessionDTO]
}

