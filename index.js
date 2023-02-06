const pdf = require("pdf-creator-node");
const fs = require("fs");
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const base64Encode = (file) => {
  let body = fs.readFileSync(file);
  return body.toString("base64");
};

app.post("/", (req, res) => {
  const html = fs.readFileSync("report.html", "utf8");
  const { data: user } = req.body;

  const options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    phantomPath: "./node_modules/phantomjs-prebuilt/bin/phantomjs",
    header: {
      contents: {
        default: `
            <div id="header_content" class="header">
              <img
                src="https://herconomy.com/wp-content/uploads/herconomyemails/herclogo1.png"
                alt=""
              />
              <p class="header-first-p">226 Awolo/Bourdilon Road Ikoyi, Lagos State.</p>
              <p>+2349047432047</p>
            </div>
            `,
      },
    },
    footer: {
      height: "50px",
      contents: {
        default: `
            <hr />
          <div style="text-align: right; padding-top: 25px;">
            <b>Page</b> <span style="color: #444;">{{page}}</span> Of <span>{{pages}}</span>
          </div>`,
      },
    },
  };

  const document = {
    html,
    data: {
      userDetails: user?.user_details || {},
      accountDetails: user?.account_details || {},
      startDate: user?.start_date,
      endDate: user?.end_date,
      vault:
        user?.vault_transactions?.map((x) => ({
          ...x,
          desc: (x.desc || "").toLowerCase(),
          created_at: x.created_at.split("T")[0],
          credit: x.description === "credit" ? `₦${x.amount}` : null,
          debit: x.description === "debit" ? `₦${x.amount}` : null,
        })) || [],
      float:
        user?.float_transactions?.map((x) => ({
          ...x,
          desc: (x.desc || "").toLowerCase(),
          created_at: x.created_at.split("T")[0],
          credit: x.description === "credit" ? `₦${x.amount}` : null,
          debit: x.description === "debit" ? `₦${x.amount}` : null,
        })) || [],
      plans:
        user?.plans_transactions?.map((x) => ({
          ...x,
          desc: (x.desc || "").toLowerCase(),
          created_at: x.created_at.split("T")[0],
          credit: x.description === "credit" ? `₦${x.amount}` : null,
          debit: x.description === "debit" ? `₦${x.amount}` : null,
        })) || [],
    },
    path: "./report.pdf",
    type: "",
  };

  pdf
    .create(document, options)
    .then(() => {
      const base64String = base64Encode("report.pdf");
      return res.json({ success: "Worked!!", data: base64String });
    })
    .catch((error) => {
      return res.json({ error: "Failed!!", error: error.message });
    });
});

app.listen(4040, () => {
  console.log("listening....");
});
