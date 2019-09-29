parser = require('instagram-id-to-url-segment');

/*
    IMPORTANT : Direct messages do not support audios or stories.
    The api ignores them and shows the previous message.
    It doesn't even show a message that an unaccepted 
    media type is received.

    I have created a custom object in order to make it more light
    when reading and saving in the database maybe it's not the best
    idea, since instagram can update and load this structure, but
    at any time we can access the original object that launches 
    the api

    TODO:
    [ ] Decide whether to use your own structure or the one that
    instagram provides (best option instagram obj)
    [ ] Save to database

*/


async function getInbox(ig, extraInfo = new Object()){ 
    const inboxFeed = await ig.feed.directInbox(); 
    const threads = await inboxFeed.items(); 



    let directMessagesFormated = threads.map(function(dm) {
        //let isRead = (dm.last_seen_at[0] > dm.last_permanent_item.timestamp && ig.loggedInUser.pk != dm.last_seen_at[1]);
        
        let myId = ig.loggedInUser.pk;
        return {
            threadId: dm.thread_id,
            threadIdV2: dm.thread_v2_id,
            isGroup: dm.users.length == 1 ? false : true,
            users: dm.users,
            readByUser: (dm.last_seen_at[Object.keys(dm.last_seen_at)[0]].timestamp == dm.last_permanent_item.timestamp),
            readByMe: (dm.last_seen_at[Object.keys(dm.last_seen_at)[1]].timestamp == dm.last_permanent_item.timestamp),
            //'MINCURSOR' means there is no older one
            oldest_cursor: dm.oldest_cursor,
            //'MAXCURSOR' means that theres no next one
            next_cursor: dm.next_cursor,
            lastMessage: {
                timeStamp: dm.last_permanent_item.timestamp,
                type: dm.last_permanent_item.item_type,
                messageContent: (function(){
                                    if (dm.last_permanent_item.link) return dm.last_permanent_item.link.text;
                                    if (dm.last_permanent_item.text) return dm.last_permanent_item.text;
                                    if (dm.last_permanent_item.media) return dm.last_permanent_item.media.image_versions2.candidates[0].url; 
                                    if (dm.last_permanent_item.animated_media) return dm.last_permanent_item.animated_media.images.fixed_height.url;
                                    if (dm.last_permanent_item.like) return "like"; //this happens when user sends a "DMLike" Reference: https://moblivious.com/wp-content/uploads/2015/09/Instagram-Chat-Attach-Heart.jpg
                                }())
            }
        }
    });

    return directMessagesFormated;
}

module.exports = getInbox;
