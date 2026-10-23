import { asyncHandler } from "../utilities/asyncHandler.js";

const provideCreatorData = asyncHandler(async (req, res) => {
     const { isAuthenticated } = req;
     return res.status(200).json({isAuthenticated})
});

export { provideCreatorData };
