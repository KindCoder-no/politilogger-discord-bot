const mongoose = require("mongoose");

const reCheckSchema = new mongoose.Schema({
    guild_id: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        required: true,
    },
    message_id: {
        type: String,
        required: true,
    },
    call_id: {
        type: String,
        required: true,
    },
    last_message: {
        type: String,
        required: false,
        default: null,
    }
});

module.exports = mongoose.model("Recheck", reCheckSchema);