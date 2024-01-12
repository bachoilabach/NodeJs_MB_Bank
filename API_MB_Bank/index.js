const express = require("express");
const db = require("./common/connect");
const app = express();
const port = 3000;

//Tài khoản


app.use(express.json());

// const accounts = {
// 	"0346331968": {
// 		name: "Tran Viet Bach",
// 		sdt: "0346331968",
// 		moneyOwn: "2,000,000,000",
// 		password: "bach112003",
// 	},
// 	"0123456789": {
// 		name: "Nguyen Van A",
// 		sdt: "0123456789",
// 		moneyOwn: "20,000,000",
// 		password: "12345678",
// 	},
// 	"0946363616": {
// 		name: "Nguyen Anh Duy",
// 		sdt: "0946363616",
// 		moneyOwn: "3,000,000,000",
// 		password: "duy2003",
// 	},
// };

const marketItems = [
	{
		image:
			"https://github.com/bachoilabach/MB_Bank_Img/blob/main/bds.jpg?raw=true",
		name: "Bất động sản",
	},
	{
		image:
			"https://github.com/bachoilabach/MB_Bank_Img/blob/main/flash-sales.jpg?raw=true",
		name: "Flash Sale",
	},
	{
		image:
			"https://github.com/bachoilabach/MB_Bank_Img/blob/main/4G.png?raw=true",
		name: "Data 3G/4G",
	},
	{
		image:
			"https://github.com/bachoilabach/MB_Bank_Img/blob/main/megatek.png?raw=true",
		name: "Megatek - Thẻ game 247",
	},
	{
		image:
			"https://github.com/bachoilabach/MB_Bank_Img/blob/main/theGame.png?raw=true",
		name: "IRIS - Thẻ game 365",
	},
	{
		image:
			"https://github.com/bachoilabach/MB_Bank_Img/blob/main/card.jpg?raw=true",
		name: "Thẻ điện thoại",
	},
	{
		image:
			"https://github.com/bachoilabach/MB_Bank_Img/blob/main/napDienthoai.png?raw=true",
		name: "Nạp điện thoại",
	},
	{
		image:
			"https://github.com/bachoilabach/MB_Bank_Img/blob/main/more-Thmbnail.png?raw=true",
		name: "Xem thêm",
	},
];

app.get("/accounts", (req, res) => {
	db.query("SELECT * FROM tblaccount", (err, accounts) => {
		if (err) {
			console.error("Lỗi khi truy vấn danh sách tài khoản", err);
			res.status(500).send({
				success: false,
				notice: "Lỗi khi lấy danh sách tài khoản",
				error: err.message,
			});
		} else {
			res.status(200).send({
				success: true,
				data: accounts,
			});
		}
	});
});
app.get("/marketItems", (req, res) => {
	const marketlist = Object.values(marketItems);
	res.send(marketlist);
});

app.get("/phoneNumbers", (req, res) => {
	const phoneNumbers = Object.keys(accounts);
	res.send(phoneNumbers);
});

app.get("/accounts/:sdt", (req, res) => {
	const sdt = req.params.sdt;
	db.query("Select * from tblaccount where sdt = ?", sdt, (err, account) => {
		if (err) {
			console.error("Lỗi khi truy vấn tài khoản", err);
			res.status(500).send({
				success: false,
				notice: "Lỗi khi lấy thông tin tài khoản",
				error: err.message,
			});
		} else {
			if (account.length === 0) {
				res.status(404).send({
					success: false,
					notice: "Số điện thoại không tồn tại",
				});
			} else {
				res.status(200).send({
					success: true,
					data: account[0],
				});
			}
		}
	});
});

app.post("/accounts", (req, res) => {
	const { name, sdt, moneyOwn, password } = req.body;

	// Kiểm tra nếu bất kỳ trường thông tin nào bị thiếu
	if (!name || !sdt || !moneyOwn || !password) {
		return res.status(400).send({
			success: false,
			notice: "Vui lòng cung cấp đầy đủ thông tin tài khoản",
		});
	}

	// Xóa dấu phẩy từ giá trị moneyOwn trước khi lưu vào cơ sở dữ liệu

	const newAccount = {
		name,
		sdt,
		moneyOwn,
		password,
	};

	db.query("INSERT INTO tblaccount SET ?", newAccount, (err, result) => {
		if (err) {
			console.error("Lỗi khi thêm tài khoản vào cơ sở dữ liệu", err);
			return res.status(500).send({
				success: false,
				notice: "Lỗi khi thêm tài khoản",
				error: err.message,
			});
		} else {
			return res.status(201).send({
				success: true,
				notice: "Thêm tài khoản thành công",
				data: newAccount,
			});
		}
	});
});

app.post("/transfer", (req, res) => {
	const { senderPhone, receiverPhone, amount, password } = req.body;

	// Kiểm tra thông tin yêu cầu
	if (!senderPhone || !receiverPhone || !amount || !password) {
		return res.status(400).send({
			success: false,
			notice: "Vui lòng cung cấp đầy đủ thông tin",
		});
	}

	// Lấy thông tin về người gửi và người nhận từ cơ sở dữ liệu
	db.query(
		"SELECT * FROM tblaccount WHERE sdt = ? AND password = ?",
		[senderPhone, password],
		(err, senderAccount) => {
			if (err) {
				console.error("Lỗi khi truy vấn tài khoản người gửi", err);
				return res.status(500).send({
					success: false,
					notice: "Lỗi khi xác minh thông tin người gửi",
					error: err.message,
				});
			}

			if (senderAccount.length === 0) {
				return res.status(404).send({
					success: false,
					notice: "Thông tin tài khoản người gửi không chính xác",
				});
			}

			const senderBalance = senderAccount[0].moneyOwn;

			// Kiểm tra xem số dư của người gửi có đủ để chuyển không
			if (parseFloat(senderBalance.replace(/,/g, "")) < parseFloat(amount)) {
				return res.status(400).send({
					success: false,
					notice: "Số dư không đủ để thực hiện giao dịch",
				});
			}

			// Trừ số tiền từ tài khoản người gửi
			const newSenderBalance =
				parseFloat(senderBalance.replace(/,/g, "")) - parseFloat(amount);
			const updatedSenderBalance = newSenderBalance.toLocaleString("en-US");

			db.query(
				"UPDATE tblaccount SET moneyOwn = ? WHERE sdt = ?",
				[updatedSenderBalance, senderPhone],
				(updateErr) => {
					if (updateErr) {
						console.error("Lỗi khi cập nhật số dư người gửi", updateErr);
						return res.status(500).send({
							success: false,
							notice: "Lỗi khi cập nhật số dư người gửi",
							error: updateErr.message,
						});
					}

					// Cập nhật số dư của người nhận
					db.query(
						"UPDATE tblaccount SET moneyOwn = moneyOwn + ? WHERE sdt = ?",
						[amount, receiverPhone],
						(updateReceiverErr) => {
							if (updateReceiverErr) {
								console.error(
									"Lỗi khi cập nhật số dư người nhận",
									updateReceiverErr
								);
								// Nếu có lỗi khi cập nhật số dư người nhận,
								// cần phải rollback số tiền đã trừ từ người gửi,
								// tuy nhiên ví dụ này không thực hiện phần rollback.
								return res.status(500).send({
									success: false,
									notice: "Lỗi khi cập nhật số dư người nhận",
									error: updateReceiverErr.message,
								});
							}

							return res.status(200).send({
								success: true,
								notice: "Chuyển tiền thành công",
							});
						}
					);
				}
			);
		}
	);
});

app.get("/", (req, res) => {
	res.send(Account.getAll);

	// res.send(accounts);
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
