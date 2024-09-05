'use strict';

const async = require('async');
const db = require('../../database');

module.exports = {
	name: 'Chat room hashes',
	timestamp: Date.UTC(2015, 11, 23),
	method: function (callback) {
		db.getObjectField('global', 'nextChatRoomId', (err, nextChatRoomId) => {
			if (err) {
				return callback(err);
			}
			processChatRooms(nextChatRoomId, callback);
		});
	},
};

function processChatRooms(nextChatRoomId, callback) {
	let currentChatRoomId = 1;
	
	async.whilst(
		() => currentChatRoomId <= nextChatRoomId,
		(next) => {
			handleChatRoom(currentChatRoomId, (err) => {
				if (err) {
					return next(err);
				}
				currentChatRoomId += 1;
				next();
			});
		},
		callback
	);
}

function handleChatRoom(chatRoomId, callback) {
	db.getSortedSetRange(`chat:room:${chatRoomId}:uids`, 0, 0, (err, uids) => {
		if (err) {
			return callback(err);
		}
		if (!isValidUid(uids)) {
			return callback();
		}
		storeChatRoom(chatRoomId, uids[0], callback);
	});
}

function isValidUid(uids) {
	return Array.isArray(uids) && uids.length > 0 && uids[0];
}

function storeChatRoom(chatRoomId, ownerUid, callback) {
	const chatRoomData = { owner: ownerUid, roomId: chatRoomId };
	db.setObject(`chat:room:${chatRoomId}`, chatRoomData, callback);
}
