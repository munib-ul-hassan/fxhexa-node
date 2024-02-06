

import RequestModel from "../DB/Model/requestModel.js";
import { handleMultipartData } from "../Utils/MultipartData.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import fs from "fs"
import { RequestValidator, updaterequestValidator } from "../Utils/Validator/orderValidation.js";
import subAccountModel from "../DB/Model/subAccountModel.js";
import cloudinary from "../Config/cloudnaryconfig.js";
import AuthModel from "../DB/Model/authModel.js";
const postRequest = async (req, res, next) => {
    try {
        const { error } = RequestValidator.validate(req.body);
        if (error) {
            return next(CustomError.badRequest(error.details[0].message));
        }
        if (req.body.requestType == "withdraw") {
            if (!req.user.KYCstatus) {
                return next(CustomError.createError("Wait for admin KYC approval, then you can start your trade", 200));
            }
        }
        req.body.user = req.user.profile._id
        
        if (req.body.requestType != "referel") {

            const accData = await subAccountModel.findById(req.body.accountref)
            if (!accData) {
                return next(CustomError.badRequest("invalid Sub-Account Id"));
            }
            if (accData.type != "real") {
                return next(CustomError.badRequest("Withdrawal only valid for real account"));
            }
        }

        if (req.file) {
            await cloudinary.uploader.upload("public/uploads/" + req.file.filename, (err, result) => {
                if (err) {
                    return next(CustomError.badRequest(err.message));
                }
                req.body.image = result.url
                // fs.unlink(item.path, (err) => {
                //   
                // })
            });


        }
        if (req.body.paymentType == "perfect" && req.body.requestType == "deposit") {
            await subAccountModel.findByIdAndUpdate(req.body.accountref, {
                $inc: { balance: req.body.amount }
            })
            req.body.status == "accepted"
            const requestData = await (new RequestModel(
                req.body
            )).save()
            if (requestData) {
                return next(
                    CustomSuccess.createSuccess(
                        requestData,
                        "Amount deposit Successfully",
                        200
                    )
                );
            } else {
                return next(
                    CustomError.createError("Error Occured", 200)
                );
            }

        }
        const requestData = await (new RequestModel(
            req.body
        )).save()
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

        // if (req.file) {
        //     fs.unlink("public/uploads/" + req.file?.filename, (err) => {
        //         console.log(err)
        //     })
        // }

        return next(CustomError.badRequest(error.message));
    }
}

const getRequestByAdmin = async (req, res, next) => {
    try {

        const { page, limit } = req.query
        delete req.query.page
        delete req.query.limit

        const data = await RequestModel.find(req.query).limit(limit).skip((page - 1) * limit).populate({ path: "accountref", select: ["name", "auth", "currency", "balance"] }).populate({ path: "user", select: ["fullName"] })
        const count = await RequestModel.count({})
        if (data.length > 0) {
            return next(
                CustomSuccess.createSuccess(
                    { count, data },
                    "Request get Successfully",
                    200
                )
            );
        } else {
            return next(
                CustomError.createError("No any request found", 200)
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
        const requestData = await RequestModel.findOne({ _id: id, status: "pending" }).populate(["accountref", "user"]);

        if (!requestData) {
            return next(CustomError.badRequest("Invalid Id or request already updated"));
        }
        const { error } = updaterequestValidator.validate(req.body)

        if (error) {
            return next(CustomError.badRequest(error.details[0].message));
        }

        if (req.body.status == "accepted") {
            if (requestData.requestType == "deposit") {

                await subAccountModel.findByIdAndUpdate(requestData.accountref._id, {
                    $inc: { balance: requestData.amount }
                })
            }
            if (requestData.requestType == "withdraw") {


                await subAccountModel.findByIdAndUpdate(requestData.accountref._id, {
                    $inc: { balance: -requestData.amount }
                })
            } else {
                const { referer } = await AuthModel.findOne({ _id: requestData.user.auth })
                let sum = 0
                referer.forEach(async (item, i) => {
                    if (sum != requestData.amount&& (sum+item.amount)>requestData.amount) {
                        const newrefere = referer.map((item, j) => {
                            const { user, amount } = item

                            if (j < i) {
                                return {
                                    user, amount: 0
                                }
                            }else if(i==j){
                                return {
                                    user, amount: amount-(requestData-sum)
                                }
                            }
                             else {
                                return {
                                    user, amount
                                }
                            }
                        })

                        await AuthModel.findByIdAndUpdate(requestData.user.auth
                            , {
                                referer:  newrefere
                            })
                        return 
                    }   
                    sum += item.amount
                    if (sum == requestData.amount) {
                        const newrefere = referer.map((item, j) => {
                            const { user, amount } = item
                            if (j <= i) {
                                return {
                                    user, amount: 0
                                }
                            } else {
                                return {
                                    user, amount
                                }
                            }
                        })

                        await AuthModel.findByIdAndUpdate(requestData.user.auth
                            , {
                                referer:  newrefere
                            })
                            return;
                    }
                    
                })
            }

            const updateRequest = await RequestModel.findOneAndUpdate({ _id: id },
                {
                    status: "accepted"
                }, {
                new: true,
            });
            return next(
                CustomSuccess.createSuccess(updateRequest, "Request updated successfully", 200),
            );
            // if (requestData.requestType == "Buy") {
            //     const coinExist = requestData.userId.auth.real.findIndex((element) => element.stock == requestData.stock)
            //     if (coinExist != -1) {
            //         const real = [...requestData.userId.auth.real]
            //         real[coinExist].amount += requestData.amount

            //         await AuthModel.updateOne({ _id: requestData.userId.auth._id }, {
            //             real
            //         })
            //         const updateRequest = await RequestModel.findOneAndUpdate({ _id: id },
            //             {
            //                 status: "accepted"
            //             }, {
            //             new: true,
            //         });
            //         await AuthModel.findOneAndUpdate({ _id: requestData.userId.auth._id }, {
            //             realbalance: requestData.userId.auth.realbalance - requestData?.exchangeAmount
            //         })

            //         return next(
            //             CustomSuccess.createSuccess(updateRequest, "Request updated successfully", 200),
            //         );

            //     } else {
            //         const real = [...requestData.userId.auth.real]
            //         real.push({
            //             amount: requestData.amount,
            //             stock: requestData.stock

            //         })

            //         await AuthModel.updateOne({ _id: requestData.userId.auth }, {
            //             real
            //         })
            //         const updateRequest = await RequestModel.findOneAndUpdate({ _id: id },
            //             {
            //                 status: "accepted"
            //             }, {
            //             new: true,
            //         });
            //         await AuthModel.findOneAndUpdate({ _id: requestData.userId.auth._id }, {
            //             realbalance: requestData.userId.auth.realbalance - requestData?.exchangeAmount
            //         })
            //         return next(
            //             CustomSuccess.createSuccess(updateRequest, "Request updated successfully", 200),
            //         );

            //     }
            // }
            // if (requestData.requestType == "Sell") {
            //     const coinExist = requestData.userId.auth.real.findIndex((element) => element.stock == requestData.stock)
            //     const real = [...requestData.userId.auth.real]
            //     real[coinExist].amount -= requestData.amount

            //     await AuthModel.updateOne({ _id: requestData.userId.auth }, {
            //         real
            //     })
            //     const updateRequest = await RequestModel.findOneAndUpdate({ _id: id },
            //         {
            //             status: "accepted"
            //         }, {
            //         new: true,
            //     });
            //     await AuthModel.findOneAndUpdate({ _id: requestData.userId.auth._id }, {
            //         realbalance: requestData.userId.auth.realbalance + requestData?.exchangeAmount
            //     })
            //     return next(
            //         CustomSuccess.createSuccess(updateRequest, "Request updated successfully", 200),
            //     );
            // }
            // if (requestData.requestType == "Deposit") {

            //     requestData.userId.auth.realbalance += requestData.amount
            //     await AuthModel.updateOne({ _id: requestData.userId.auth }, {
            //         realbalance: requestData.userId.auth.realbalance
            //     })
            //     const updateRequest = await RequestModel.findOneAndUpdate({ _id: id },
            //         {
            //             status: "accepted"
            //         }, {
            //         new: true,
            //     });
            //     return next(
            //         CustomSuccess.createSuccess(updateRequest, "Request updated successfully", 200),
            //     );
            // }

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
        const { page, limit, from, to } = req.query
        delete req.query.page
        delete req.query.limit


        if (from && to) {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(from) || !datePattern.test(to)) {
                return next(CustomError.createError("Invalid date format", 200));
            }
            var fromDate = new Date(from)
            fromDate.setHours(0, 0, 0, 0);
            var toDate = new Date(to)

            toDate.setHours(23, 59, 59, 999);


            req.query.createdAt = {
                $gte: fromDate, $lte: toDate
            }
            delete req.query.from
            delete req.query.to
        }
        const data = await RequestModel.find({ user: req.user.profile._id, ...req.query }).limit(limit).skip((page - 1) * limit)
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
