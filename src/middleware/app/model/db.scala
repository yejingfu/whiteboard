package model

import java.util.Date

sealed abstract class BaseDB(id: String, created: Date = new Date, modified: Date = new Date)

case class SessionDB(sid: String, uid: String, logints: Long, updatets: Long, logoutts: Long)
  extends BaseDB(sid)

case class UserDB(uid: String, email: String, passwd: String, uniquetag: Option[String], username: Option[String])
  extends BaseDB(uid)
