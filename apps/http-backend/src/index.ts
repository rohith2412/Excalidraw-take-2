import express  from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { z } from "zod"
import { prismaClient } from "@repo/db/client";

const JWT_SECRET = process.env.JWT_SECRET || "kurgf";
const app = express();
app.use(express.json());

const CreateUserScheam = z.object({
    username:z.string().min(3).max(20),
    password: z.string(),
    name: z.string()
})

const SigninSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string()
})

const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20),
})

app.get("/check-db", async (req, res) => {
    try {
        const userCount = await prismaClient.user.count();
        res.json({
            message: "Database is connected",
            userCount
        });
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({
            message: "Database connection failed",
            error: (error as Error).message
        });
    }
});

app.post("/signup", async (req, res) => {

    const parsedData = CreateUserScheam.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})
app.post("/signin", (req, res) => {
    const data = SigninSchema.safeParse(req.body);
    if(!data.success) {
        res.json({
            message: "incorrect input"
        })
        return;
    }
    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET)
})

app.post("/room", middleware, (req, res) => {
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success) {
        res.json({
            message: "incorrect input"
        })
        return;
    }
    res.json({
        room: 123
    })     
})

app.listen(2000);