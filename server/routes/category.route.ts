import { Router } from "express";
import { getAllCategories, getAllProductsOfCategories, getProduct } from "../controller/categories.controller";


const categoryRouter = Router();

categoryRouter.get('/getCatergory',getAllCategories);
categoryRouter.get('/products-by-category', getAllProductsOfCategories);
categoryRouter.get('/getProduct', getProduct);

export default categoryRouter;