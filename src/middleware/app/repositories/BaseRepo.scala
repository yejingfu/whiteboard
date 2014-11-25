package repositories

import model.{UserDB, SessionDB}

import scala.reflect.runtime.universe.{TypeTag, typeOf}

trait BaseRepo {
  def getNS[T: TypeTag] =
    if (typeOf[T] =:= typeOf[SessionDB]) "s:"
    else if (typeOf[T] =:= typeOf[UserDB]) "u:"
    else ""
}
