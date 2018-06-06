const { IncomingWebhook } = require("@slack/client");

// https://api.slack.com/docs/message-attachments#color
// https://circleci.com/docs/api/v1-reference/#build
const STATUS_COLORS = {
	"success": "good",
	"fixed": "good",
	"failed": "danger",
	"timedout": "danger",
	"infrastructure_fail": "warning",
	DEFAULT: "#76a9fa"
};

// Fill your configures.
const CONFIGURES = [
	// {
	// 	branches: ["develop"],
	// 	statuses: ["failed", "fixed", "timedout", "infrastructure_fail"],
	// 	slackWebhookUrl: "https://hooks.slack.com/services/foo/bar/baz",
	// 	channel: "random" // Optional
	// }
];

exports.circleci2slack = (req, res) => {
	if (req.method !== 'POST') {
		console.error("Invalid method")
		res.status(400).send("Invalid method");
		return;
	}
	if (!req.is("application/json")) {
		console.error("Invalid Content-Type")
		res.status(400).send("Invalid Content-Type");
		return;
	}

	// https://circleci.com/docs/1.0/configuration/#notify
	const payload = req.body.payload;

	const config = CONFIGURES.find(c => c.branches.includes(payload.branch) && c.statuses.includes(payload.status));
	if (config == null) {
		return; // NOOP
	}

	const linkText = payload.build_url.replace("https://circleci.com/gh/", "");
	const body = {
		attachments: [{
			title: `${payload.status} : ${payload.committer_name}'s build. <${payload.build_url}|${linkText}>`,
			text: payload.subject,
			color: STATUS_COLORS[payload.status] || STATUS_COLORS.DEFAULT,
			fields: [
				{ title: "Branch", value: payload.branch, short: true },
				{ title: "Job Name", value: payload.workflows ? payload.workflows.job_name : null, short: true }
			]
		}]
	};

	const webhook = new IncomingWebhook(config.slackWebhookUrl, { channel: config.channel || undefined });
	webhook.send(body, (slackErr, slackRes) => {
		if (slackRes) {
			console.log(slackRes);
		}
		if (slackErr) {
			console.error(slackErr);
		} else {
			res.status(200).send("Suscssed");
		}
	});
};