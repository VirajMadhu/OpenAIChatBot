import express from "express";
import session from "express-session";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const port = 5000;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

// 设置会话中间件
app.use(session({
	secret: "nodejs world",
	resave: false,
	saveUninitialized: false,
	name: "session_id",
	rolling: true,
	cookie: {
		path: '/',
		httpOnly: true,
		secure: false
	}
}));

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello friends! The API server is up and running. This API was built by Viraj.',
    })
});

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        // 从会话中获取数据
        const sessionId = req.session.id;
        const msg = req.session.msgResponse || [];
	
	msg.push({"role": "user", "content": `${prompt}`});    
        console.log(`Session ID: ${sessionId}`);
	console.log(JSON.stringify(msg));

        if (prompt.indexOf("遗忘") == 0){
             req.session.destroy();
		var resultText="我已经清空记忆！请重新提问！";

        }else{


      	  const response = await openai.createChatCompletion({
        	    model: "gpt-3.5-turbo",
           	 messages: msg
        	});

        	var resultText = response.data.choices[0].message.content;
		msg.push({"role": "assistant", "content": `${resultText}`});
		req.session.msgResponse=msg;
	}
        res.status(200).send({
            bot: resultText
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
})

app.listen(port,
    () => console.log(`Server is running on http://localhost:${port}`)
);
