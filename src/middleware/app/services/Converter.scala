package services

import model.ResponseDTO
import scala.concurrent.Future

package object services {
  type ServerResponse[T] = Future[ResponseDTO[T]]
}

object Converter {

}
