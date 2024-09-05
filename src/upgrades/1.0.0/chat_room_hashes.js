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
			processChatRooms(1, nextChatRoomId, callback);
		});
	},
};

function processChatRooms(currentChatRoomId, nextChatRoomId, callback) {
	console.log('>>>processChatRooms accessed');
	async.whilst(
		next => next(null, currentChatRoomId <= nextChatRoomId),
		(next) => { // Added parentheses around (next)
			processSingleChatRoom(currentChatRoomId, () => {
				currentChatRoomId += 1; // Replacing unary operator '++'
				next();
			});
		},
		callback
	);
}

function processSingleChatRoom(chatRoomId, next) {
	console.log('>>>processSingleChatRoom accessed');
	getFirstUserFromChatRoom(chatRoomId, (err, firstUser) => {
		if (err || !firstUser) {
			return next(err); // Continue on error or if no user found
		}
		setChatRoomOwner(chatRoomId, firstUser, next);
	});
}

function getFirstUserFromChatRoom(chatRoomId, callback) {
	console.log('>>>getFirst accessed');
	db.getSortedSetRange(`chat:room:${chatRoomId}:uids`, 0, 0, (err, uids) => {
		if (err) {
			return callback(err);
		}
		callback(null, Array.isArray(uids) && uids.length && uids[0] ? uids[0] : null);
	});
}

function setChatRoomOwner(chatRoomId, ownerId, callback) {
	console.log('>>>setChatRoomOwner accessed');
	db.setObject(`chat:room:${chatRoomId}`, { owner: ownerId, roomId: chatRoomId }, callback);
}
