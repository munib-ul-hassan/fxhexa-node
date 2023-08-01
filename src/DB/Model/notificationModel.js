import { Schema, model }  from 'mongoose'

const NotificationSchema = new Schema({
  userType: {
    type: String,
    enum: ["Instructor", "Customer"],
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    refPath: "userType",
    require: true,
  },
  title: {
    type: String,
    default: '',
  },
  body: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '',
  },
  isRead: {
    type: Boolean,
    default: false,
  },

},{timestamps:true})

const NotificationModel = model('Notification', NotificationSchema)

export default NotificationModel
