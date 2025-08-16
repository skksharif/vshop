import { Router } from "express";
import {
  approveOrder,
  creatCategory,
  creatProducts,
  getPendingOrders,
  getUnverifiedUsers,
  markOrderShipped,
  verifyUser,
  setCreditLimit,
  updateCreditLimit,
} from "../controller/admin.controller";
import {
  authenticateToken,
  requireAdminRole,
} from "../middleware/auth.middleware";

const adminRouter = Router();

adminRouter.use(authenticateToken, requireAdminRole);

adminRouter.get("/unverified-users", getUnverifiedUsers);
adminRouter.patch("/verifyUser", verifyUser);
adminRouter.post("/create-category", creatCategory);
adminRouter.post("/create-product", creatProducts);
adminRouter.get("/orders/pending", getPendingOrders);
adminRouter.post("/orders/approve", approveOrder); 
adminRouter.post("/orders/shipped", markOrderShipped); 
adminRouter.post("/set-credit-limit", setCreditLimit);
adminRouter.post("/update-credit-limit", updateCreditLimit);

export default adminRouter;
