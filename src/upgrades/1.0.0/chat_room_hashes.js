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

			let currentChatRoomId = 1;
			async.whilst(
				(next) => { shouldProcessNextRoom(currentChatRoomId, nextChatRoomId, next); },
				(next) => {
					processChatRoom(currentChatRoomId, next, () => {
						currentChatRoomId += 1;
					});
				},
				callback
			);
		});
	},
};

function shouldProcessNextRoom(currentChatRoomId, nextChatRoomId, next) {
	next(null, currentChatRoomId <= nextChatRoomId);
}

function processChatRoom(currentChatRoomId, next, incrementCurrentChatRoom) {
	getRoomUids(currentChatRoomId, (err, uids) => {
		if (err) {
			return next(err);
		}

		if (!isValidUids(uids)) {
			incrementCurrentChatRoom();
			return next();
		}

		setChatRoomOwner(currentChatRoomId, uids[0], (err) => {
			if (err) {
				return next(err);
			}
			incrementCurrentChatRoom();
			next();
		});
	});
}

function getRoomUids(currentChatRoomId, callback) {
	db.getSortedSetRange(`chat:room:${currentChatRoomId}:uids`, 0, 0, callback);
}

function isValidUids(uids) {
	return Array.isArray(uids) && uids.length && uids[0];
}

function setChatRoomOwner(roomId, ownerUid, callback) {
	db.setObject(`chat:room:${roomId}`, { owner: ownerUid, roomId }, callback);
}
