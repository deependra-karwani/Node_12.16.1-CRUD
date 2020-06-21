exports.success = (res, data) => {
	res.status(200).send(data);
};

exports.successWHeaders = (res, headers, data) => {
	res.status(200).set(headers).send(data);
}


exports.badReq = (res, data) => {
	res.status(400).send(data);
};

exports.unauth = (res, data) => {
	res.status(401).send(data);
};

exports.forbidden = (res, data) => {
	res.status(403).send(data);
};