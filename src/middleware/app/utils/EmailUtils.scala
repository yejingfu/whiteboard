package utils

object EmailUtils {

  val emailReg = "^[A-Za-z0-9]+[\\._A-Za-z0-9-]*@[A-Za-z0-9]+[\\._A-Za-z0-9-]*\\.[A-Za-z]{2,}$"

  def isValidateFormat(email: String) = {
    email.matches(emailReg)
  }

}
