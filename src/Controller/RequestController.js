
import AuthModel from "../DB/Model/authModel.js";
import RequestModel from "../DB/Model/requestModel.js";
import { handleMultipartData } from "../Utils/MultipartData.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import fs from "fs"
import { RequestValidator, updaterequestValidator } from "../Utils/Validator/transactionValidation.js";
const postRequest = async (req, res, next) => {
    try {
        const { error } = RequestValidator.validate(req.body);
        if (error) {
            return next(CustomError.badRequest(error.details[0].message));
        }
        req.body.userId = req.user.profile._id

        const { userId, amount, stock, requestType, exchangeAmmount } = req.body
        if (requestType == "Sell") {
            const i = req.user.real.findIndex((ele) => ele.stock == stock)
            if (i != -1) {
                if (req.user.real[i].amount < amount) {
                    return next(
                        CustomError.createError("you have less credits than the requested amount", 200)
                    );
                }
            } else {
                return next(
                    CustomError.createError("You have no any unit of this stock", 200)
                );
            }

        }
        if (req.file) {
            req.body.image = req.file?.filename
        }
        const requestData = await (new RequestModel({
            userId, amount, stock, requestType, image: req.body.image, exchangeAmmount
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
        if (req.file) {
            fs.unlink("public/uploads/" + req.file?.filename, (err) => {
                console.log(err)
            })
        }

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
        const requestData = await RequestModel.findOne({ _id: id, status: "pending" }).populate({ path: "userId", populate: { path: "auth" } });

        if (!requestData) {
            return next(CustomError.badRequest("Invalid Id or request already updated"));
        }
        const { error } = updaterequestValidator.validate(req.body)
        console.log(error)
        if (error) {
            return next(CustomError.badRequest(error.details[0].message));
        }

        if (req.body.status == "accepted") {
            if (requestData.requestType == "Buy") {

                const coinExist = requestData.userId.auth.real.findIndex((element) => element.stock == requestData.stock)
                console.log(coinExist)
                if (coinExist != -1) {
                    const real = [...requestData.userId.auth.real]
                    real[coinExist].amount += requestData.amount

                    await AuthModel.updateOne({ _id: requestData.userId.auth }, {
                        real
                    })
                    const updateRequest = await RequestModel.findOneAndUpdate({ _id: id },
                        {
                            status: "accepted"
                        }, {
                        new: true,
                    });
                    return next(
                        CustomSuccess.createSuccess(updateRequest, "Request updated successfully", 200),
                    );

                } else {
                    const real = [...requestData.userId.auth.real]
                    real.push({
                        amount: requestData.amount,
                        stock: requestData.stock

                    })

                    await AuthModel.updateOne({ _id: requestData.userId.auth }, {
                        real
                    })
                    const updateRequest = await RequestModel.findOneAndUpdate({ _id: id },
                        {
                            status: "accepted"
                        }, {
                        new: true,
                    });
                    return next(
                        CustomSuccess.createSuccess(updateRequest, "Request updated successfully", 200),
                    );

                }
            }
            if (requestData.requestType == "Sell") {
                const coinExist = requestData.userId.auth.real.findIndex((element) => element.stock == requestData.stock)
                const real = [...requestData.userId.auth.real]
                real[coinExist].amount -= requestData.amount

                await AuthModel.updateOne({ _id: requestData.userId.auth }, {
                    real
                })
                const updateRequest = await RequestModel.findOneAndUpdate({ _id: id },
                    {
                        status: "accepted"
                    }, {
                    new: true,
                });
                return next(
                    CustomSuccess.createSuccess(updateRequest, "Request updated successfully", 200),
                );
            }
        }
        if (req.body.status == "cancelled") {
            const updateRequest = await RequestModel.findOneAndUpdate({ _id: id },
                {
                    status: "cancelled",
                    comment: req.body.comment
                }, {
                new: true,
            });
            return next(
                CustomSuccess.createSuccess(updateRequest, "Request updated successfully", 200),
            );
        }
        return next(CustomError.badRequest("Invalid data"));


    } catch (error) {
        console.log(error)

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
