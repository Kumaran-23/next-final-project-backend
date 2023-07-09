app.post("/schedule/create", (req, res) => {
    const { userId, timezone, schedule } = req.body;
    console.log(req.body);
});