


import { Router, application } from "express";
import RequestController from "../Controller/RequestController.js";
import { AdminMiddleware, AuthMiddleware } from "./Middleware/AuthMiddleware.js";
export const RequestRouters = Router();

application.prefix = Router.prefix = function (path, middleware, configure) {
    configure(RequestRouters);
    this.use(path, middleware, RequestRouters);
    return RequestRouters;
};



RequestRouters.route("/user/request").post(AuthMiddleware,
    RequestController.postRequest
);
RequestRouters.route("/user/request").get(AuthMiddleware,
    RequestController.getRequestByUser
);



RequestRouters.prefix("/admin", AdminMiddleware, async function () {
    RequestRouters.route("/request").get(
        RequestController.getRequestByAdmin
        
    );

    RequestRouters.route("/request/:id").put(
        RequestController.updateRequest
    );
    RequestRouters.route("/request/:id").delete(
        RequestController.deleteRequest
    );
}
)
