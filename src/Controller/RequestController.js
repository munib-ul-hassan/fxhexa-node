
import RequestModel from "../DB/Model/requestModel.js";
import { handleMultipartData } from "../Utils/MultipartData.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import fs from "fs"


const postRequest = async (req, res, next) => {
    try {
        req.body.userId = req.user.profile._id
        const { userId, amount, stock, requestType } = req.body
        if (!(userId && amount && stock && requestType)) {
            return next(CustomError.badRequest(error.details[0].message));
        }
        if (req.file) {

            req.body.image = req.file.filename
        }
        const requestData = await (new RequestModel({
            userId, amount, stock, requestType, image: req.body.image
        })).save()
        if (requestData) {
            return next(
                CustomSuccess.createSuccess(
                    requestData,
                    "Request generated Successfully",
                    200
                )
            );
        } else {
            return next(
                CustomError.createError("Error Occured", 200)
            );
        }


    } catch (error) {


        return next(CustomError.badRequest(error.message));
    }
}
const getRequestByAdmin = async (req, res, next) => {
    try {
        console.log(req.query)
        const { page, limit } = req.query
        delete req.query.page
        delete req.query.limit
        const data = await RequestModel.find(req.query).limit(limit).skip((page - 1) * limit)
        console.log(data);
        if (data.length > 0) {
            return next(
                CustomSuccess.createSuccess(
                    data,
                    "Request get Successfully",
                    200
                )
            );
        } else {
            return next(
                CustomError.createError("Error Occured", 200)
            );
        }


    } catch (error) {


        return next(CustomError.badRequest(error.message));
    }
}
const updateRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(CustomError.badRequest("id is required"));
        }
        const requestData = await RequestModel.findById(id);
        if (!requestData) {
            return next(CustomError.badRequest("Invalid Id"));
        } else {
            const updateprivacy = await RequestModel.findOneAndUpdate({ _id: id }, req.body, {
                new: true,
            });
            return next(
                CustomSuccess.createSuccess(updateprivacy, "Request updated successfully", 200),
            );
        }

    } catch (error) {


        return next(CustomError.badRequest(error.message));
    }
}
const deleteRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(CustomError.badRequest("id is required"));
        }
        const requestData = await RequestModel.findById(id);
        if (!requestData) {
            return next(CustomError.badRequest("Invalid Id"));
        } else {
            console.log(requestData);
            fs.unlink("./public/uploads/" + requestData.image, (err) => {
                if (err) {
                    console.log(err)
                }
            })
            const updateprivacy = await RequestModel.findOneAndDelete({ _id: id });
            return next(
                CustomSuccess.createSuccess({}, "Request deleted successfully", 200),
            );
        }

    } catch (error) {


        return next(CustomError.badRequest(error.message));
    }
}

const getRequestByUser = async (req, res, next) => {
    try {
        const { page, limit } = req.query
        delete req.query.page
        delete req.query.limit
        const data = await RequestModel.find({ userId: req.user.profile._id, ...req.query }).limit(limit).skip((page - 1) * limit)
        if (data.length > 0) {
            return next(
                CustomSuccess.createSuccess(
                    data,
                    "Request get Successfully",
                    200
                )
            );
        } else {
            return next(
                CustomSuccess.createSuccess(
                    {},
                    "No any data yet",
                    200
                )
            );
        }

    } catch (error) {


        return next(CustomError.badRequest(error.message));
    }
}

const RequestController = {

    postRequest: [handleMultipartData.single("file"), postRequest]
    , getRequestByAdmin, getRequestByUser, updateRequest, deleteRequest

};
export default RequestController;
