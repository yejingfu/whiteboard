package utils

import play.api.cache.Cache

import scala.reflect.ClassTag

object CacheProvider {

  def getOrElse[A: ClassTag](key: String, expiration: Int = 0)(orElse: => A): A = {
    try {
      Cache.getOrElse[A](key, expiration)(orElse)
    } catch {
      case e: Exception => orElse
    }
  }

  def get[A: ClassTag](key: String): Option[A] = {
    Cache.get(key) match {
      case Some(v) =>
        try {
          Some(v.asInstanceOf[A])
        } catch {
          case e: Exception => None
        }
      case _ => None
    }
  }

  def set(key: String, v: Any, expiration: Int = 0) = {
    Cache.set(key, v, expiration)
  }

  def remove(key: String) = Cache.remove(key)

}
