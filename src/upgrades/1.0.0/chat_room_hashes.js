'use strict';

const async = require('async');
const db = require('../../database');

module.exports = {
	name: 'Chat room hashes',
	timestamp: Date.UTC(2015, 11, 23),
	method: function (callback) {
		console.log('ndevidze');
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
	console.log('ndevidze');
	next(null, currentChatRoomId <= nextChatRoomId);
}

function processChatRoom(currentChatRoomId, next, incrementCurrentChatRoom) {
	console.log('ndevidze');
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
	console.log('ndevidze');
	db.getSortedSetRange(`chat:room:${currentChatRoomId}:uids`, 0, 0, callback);
}

function isValidUids(uids) {
	console.log('ndevidze');
	return Array.isArray(uids) && uids.length && uids[0];
}

function setChatRoomOwner(roomId, ownerUid, callback) {
	console.log('ndevidze');
	db.setObject(`chat:room:${roomId}`, { owner: ownerUid, roomId }, callback);
}
