package com.yookos.api.core.v3.services.users;

import com.jivesoftware.community.Attachment;
import com.jivesoftware.community.AttachmentNotFoundException;
import com.jivesoftware.community.Avatar;

/**
 * Created with IntelliJ IDEA.
 * User: emile
 * Date: 11/21/13
 * Time: 12:01 PM
 * To change this template use File | Settings | File Templates.
 */
public class AvatarEntity {
    long ownerID;
    long avatarID;
    Attachment attachment;

    public AvatarEntity(long avatarID, long ownerID) {
        this.avatarID = avatarID;
        this.ownerID = ownerID;
    }

    public AvatarEntity(Avatar avatar) {
        this.avatarID = avatar.getID();
        this.ownerID =  avatar.getOwner().getID();

        try {
            this.attachment = avatar.getAttachment();
        } catch (AttachmentNotFoundException e) {
            e.printStackTrace();
        }
    }

    public long getAvatarID() {
        return avatarID;
    }

    public void setAvatarID(long avatarID) {
        this.avatarID = avatarID;
    }

    public long getOwnerID() {
        return ownerID;
    }

    public void setOwnerID(long ownerID) {
        this.ownerID = ownerID;
    }
}
