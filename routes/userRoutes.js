var router = require('express').Router();
var controller = require('../controllers/userController');
var auth = require('../middlewares/auth');
var upload = require('../middlewares/upload');

router.post("/register", upload.single('prof'), controller.register);
router.put("/login", controller.login);
router.put("/forgot", controller.forgotPassword);
router.get("/logout", controller.logout);

router.get("/getAll", auth.tokenAuth, controller.getAll);
router.get("/getDetails", auth.tokenAuth, controller.getDetails);
router.put("/updProf", auth.tokenAuth, upload.single('prof'), controller.updateProfile);
router.delete("/delAcc", auth.tokenAuth, controller.deleteAccount);

router.get("/refresh", auth.refreshAuth, controller.refreshToken)

module.exports = router;