import _ from "lodash"

export const pickUser = (user) => {
  if (!user) return null
  // return {
  //   _id: user._id,
  //   email: user.email,
  //   username: user.username,
  //   displayName: user.displayName,
  //   avatar: user.avatar,
  //   role: user.role,
  //   isActive: user.isActive,
  //   createdAt: user.createdAt,
  //   updatedAt: user.updatedAt,
  //   // thêm các field khác nếu cần
  // }
  return _.pick(user , ['_id','email','username','displayName','avatar', 'role','isActive','createdAt','updatedAt'])
}