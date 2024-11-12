const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
    guild_id: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        required: true,
    },
    police_department: {
        type: String,
        required: false,
    },
    categories: {
        type: Array,
        required: false,
    },
    last_message: {
        type: String,
        required: false,
        default: null,
    }
});

module.exports = mongoose.model("Channel", channelSchema);