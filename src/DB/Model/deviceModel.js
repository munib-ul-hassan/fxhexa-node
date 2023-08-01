import mongoose ,{Schema,model}from 'mongoose'

const DeviceSchema = new Schema({
  auth: {
    type: Schema.Types.ObjectId,
    ref: 'Auth',
  },
  deviceType: {
    type: String,
    enum: ["android", "ios","web", "postman"]
    //O:andriod,1:IOS
  },
  deviceToken: {
    type: String,
    default: '',
  },
  lastSeen: {
    type: Date,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'loggedOut'],
  },
})
const DeviceModel = model('Device', DeviceSchema)

export default DeviceModel
