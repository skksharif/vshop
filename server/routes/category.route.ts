import { Router } from "express";
import { getAllCategories, getAllProductsOfCategories, getProduct } from "../controller/categories.controller";
import { getAllProducts } from "../controller/admin.controller";


const categoryRouter = Router();

categoryRouter.get('/getCatergory',getAllCategories);
categoryRouter.get('/products-by-category', getAllProductsOfCategories);
categoryRouter.get('/getProduct', getProduct);
categoryRouter.get('/getallproducts',getAllProducts);

export default categoryRouter;