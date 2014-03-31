package com.yookos.api.core.v3.converters.communications;

import com.google.common.collect.Lists;
import com.jivesoftware.api.core.jaxrs.LocaleProvider;
import com.jivesoftware.api.core.v3.converters.activity.ActivityObjectEntityHelper;
import com.jivesoftware.api.core.v3.customizers.InboxEntryCustomizer;
import com.jivesoftware.api.core.v3.entities.activity.*;
import com.jivesoftware.api.core.v3.providers.JiveObjectProvider;
import com.jivesoftware.base.UnauthorizedException;
import com.jivesoftware.base.User;
import com.jivesoftware.base.UserManager;
import com.jivesoftware.base.UserNotFoundException;
import com.jivesoftware.community.EntityDescriptor;
import com.jivesoftware.community.JiveObject;
import com.jivesoftware.community.JiveObjectLoader;
import com.jivesoftware.community.NotFoundException;
import com.jivesoftware.community.extactivity.StreamChannel;
import com.jivesoftware.community.extactivity.StreamEntry;
import com.jivesoftware.community.extactivity.StreamEntryAction;
import com.jivesoftware.community.inbox.InboxEntry;
import com.jivesoftware.community.invitation.Invitation;
import com.jivesoftware.community.user.relationships.UserRelationship;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import javax.annotation.Nullable;
import java.net.URI;
import java.util.*;

/**
 * <p>Convert {@link InboxEntry} and its subclasses into an {@link ActivityEntity} in the standard
 * Activity Streams 1.0 format.</p>
 *
 * Revised for improvement: see  MS-70
 * @author Emile
 */
public class ToDoActivityEntityConverter extends com.jivesoftware.api.core.v3.converters.communications.ToDoActivityEntityConverter {

    protected static final Logger log = Logger.getLogger(ToDoActivityEntityConverter.class);

    // ----------------------------------------------------------------------------------------- EntityConverter Methods

    @Override
    public ActivityEntity convert(@Nullable InboxEntry entry, String fields) {
        ActivityEntity entity = newInstance(entry, authenticationProvider.getJiveUser(), fields);
        JiveObject target = null;
        try {
            target = jiveObjectLoader.getJiveObject(entry.getTargetObjectType(), entry.getTargetID());
        } catch (NotFoundException e) {
            // Leave target set to null
        } catch (UnauthorizedException e) {
            throw coreErrorBuilder.forbiddenException("api.core.v3.error.forbidden_request")
                    .build();
        }
        // Populate the various objects first so we can extract information from them
        populateActor(entry, entity, target);
        populateGenerator(entry, entity, target);
        populateObject(entry, entity, target);
        populateProvider(entry, entity, target);
        populateTarget(entry, entity, target);
        // Now populate the top level scalar fields
        populateContent(entry, entity, target);
        populateIcon(entry, entity, target);
        populateID(entry, entity, target);
        populatePublished(entry, entity, target);
        populateTitle(entry, entity, target);
        populateUpdated(entry, entity, target);
        populateURL(entry, entity, target);
        populateVerb(entry, entity, target);
        // Finally, populate the extension elements
        populateJive(entry, entity, target);
        populateOpenSocial(entry, entity, target);
        customize(entry, entity);
        return entity;
    }

    @Override
    protected ActivityEntity newInstance(InboxEntry entry, User viewer, String fields) {
        ActivityEntity entity = new ActivityEntity(entry, viewer, fields);
        return entity;
    }

    // ------------------------------------------------------------------------------------------------- Support Methods

    // If there is a customizer for this InboxEntry subclass, give it a crack at the entity after default population
    protected void customize(InboxEntry entry, ActivityEntity entity) {
        InboxEntryCustomizer customizer = customizers.get(entry.getClass());
        if (customizer != null) {
            customizer.customize(entry, entity);
        }
    }

    protected void populateActor(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("actor")) {
            if (target instanceof StreamEntry) {
                User actor = ((StreamEntry) target).getUser();
                ActivityObjectEntity object = activityObjectEntityHelper.convertJiveObject(actor);
                entity.setActor(object);
            } else if (target instanceof Invitation) {
                Invitation invitation = (Invitation) target;
                User inviter = invitation.getInviter();
                ActivityObjectEntity object = activityObjectEntityHelper.convertJiveObject(inviter);
                entity.setActor(object);
            } else if (target instanceof UserRelationship){ //MS-70
                UserRelationship relationship = (UserRelationship) target;
                try {
                    User actor = userManager.getUser(relationship.getUserID());
                    ActivityObjectEntity object = activityObjectEntityHelper.convertJiveObject(actor);
                    entity.setActor(object);
                } catch (UserNotFoundException e) {
                    e.printStackTrace();
                }

            } else {
                // TODO - populateActor() for non stream entries
            }
        }
    }

    private static final String FRIEND_REQUEST_STRING = "%s would like to add you as a friend";
    private static final String FRIEND_ADDED_STRING = "%s has been added as your friend";

    protected void populateContent(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("content")) {
            if (target instanceof StreamEntry) {
                Locale locale = localeProvider.get();
                String content = ((StreamEntry) target).getActivityBody(locale);
                entity.setContent(content);
            } else if(target instanceof UserRelationship){  //MS-70
                UserRelationship relationship = (UserRelationship) target;
                if(relationship.isPending()) {
                    //TODO MS-71 : use translated text - LocaleUtils.getLocalizedString  using key social.friend.request.content
                    entity.setContent(String.format(FRIEND_REQUEST_STRING, entity.getActor().getDisplayName()));
                } else if(relationship.isApproved()) {
                    //TODO MS-71 : use translated text
                    entity.setContent(String.format(FRIEND_ADDED_STRING, entity.getActor().getDisplayName()));
                }
            } else {
                // TODO - populateActor() for non stream OTHER entries
            }
        }
    }

    protected void populateGenerator(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("generator")) {
            if (target instanceof StreamEntry) {
                StreamChannel channel = ((StreamEntry) target).getStreamChannel();
                JiveObject generator = channel.getGeneratorAsJiveObject();
                if (generator != null) {
                    ActivityObjectEntity object = activityObjectEntityHelper.convertJiveObject(generator);
                    entity.setGenerator(object);
                }
            } else {
                // TODO - populateGenerator() for non stream entries
            }
        }
    }

    protected void populateIcon(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("icon")) {
            if (target instanceof StreamEntry) {
                String icon = ((StreamEntry) target).getActivityFaviconURL();
                if (icon != null) {
                    MediaLinkEntity mle = new MediaLinkEntity(null, authenticationProvider.getJiveUser(), null);
                    mle.setUrl(icon);
                    entity.setIcon(mle);
                }
            } else {
                // TODO - populateIcon() for non stream entries
            }
        }
    }

    protected void populateID(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("id")) {
            URI uri = jiveObjectProvider.uri(entry);
            entity.setId(uri.toString());
        }
    }

    protected void populateJive(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("jive")) {
            JiveExtensionEntity jive = new JiveExtensionEntity(null, authenticationProvider.getJiveUser(), null);
            jive.setState(entry.getState().toString());
            entity.setJive(jive);
        }
    }

    protected void populateObject(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("object")) {
            if (target instanceof StreamEntry) {
                StreamEntry se = (StreamEntry) target;
                EntityDescriptor ed = se.getObject();
                if (ed != null) {
                    ActivityObjectEntity object = activityObjectEntityHelper.convertEntityDescriptor(ed);
                    entity.setObject(object);
                }
            } else if (target instanceof Invitation) {
                Invitation invitation = (Invitation) target;
                User invitee = invitation.getUser();
                ActivityObjectEntity object = activityObjectEntityHelper.convertJiveObject(invitee);
                entity.setObject(object);
            } else {
                EntityDescriptor ed = new EntityDescriptor(entry.getTargetObjectType(), entry.getTargetID());
                if (ed != null) {
                    ActivityObjectEntity object = activityObjectEntityHelper.convertEntityDescriptor(ed);
                    entity.setObject(object);
                }
            }
        }
    }

    protected void populateOpenSocial(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("openSocial")) {
            OpenSocialEntity ose = new OpenSocialEntity(null, authenticationProvider.getJiveUser(), null);
            // Populate actionLinks list if actions are present
            if (target instanceof StreamEntry) {
                List<StreamEntryAction> seas = ((StreamEntry) target).getStreamEntryActions();
                if ((seas != null) && (seas.size() > 0)) {
                    List<ActionLinkEntity> actionLinks = Lists.newArrayListWithCapacity(seas.size());
                    for (StreamEntryAction sea : seas) {
                        ActionLinkEntity actionLink = new ActionLinkEntity(null, authenticationProvider.getJiveUser(), null);
                        actionLink.setCaption(sea.getLabel());
                        actionLink.setHttpVerb(sea.getMethod().toString().toUpperCase());
                        actionLink.setTarget(sea.getUrl());
                        actionLinks.add(actionLink);
                    }
                    ose.setActionLinks(actionLinks);
                }
            } else {
                Locale locale = localeProvider.get();
                Map<String, Object> templateData = entry.getTemplateData(locale);
                if (templateData != null) {
                    Object actionsData = templateData.get("actions");
                    if ((actionsData != null) && (actionsData instanceof Map[])) {
                        try {
                            Map<String, Object>[] actions = (Map<String, Object>[]) actionsData;
                            List<ActionLinkEntity> actionLinks = Lists.newArrayListWithCapacity(actions.length);
                            for (Map<String, Object> action : actions) {
                                ActionLinkEntity actionLink = new ActionLinkEntity(null, authenticationProvider.getJiveUser(), null);
                                if (action.containsKey("name")) {
                                    actionLink.setCaption(action.get("name").toString());
                                    actionLinks.add(actionLink);
                                }
                            }
                            if (actionLinks.size() > 0) {
                                ose.setActionLinks(actionLinks);
                            }
                        } catch (ClassCastException e) {
                            log.warn(e);
                        }
                    }
                }
            }
            // Populate deliverTo list from approvers (if any)
            Set<Long> approvers = entry.getApprovers();
            if ((approvers != null) && (approvers.size() > 0)) {
                User viewer = authenticationProvider.getJiveUser();
                List<String> deliverTo = Lists.newArrayListWithCapacity(approvers.size());
                for (Long approver : approvers) {
                    if (approver == viewer.getID()) {
                        continue;
                    }
                    try {
                        User user = userManager.getUser(approver);
                        String uri = jiveObjectProvider.uri(user).toString();
                        deliverTo.add(uri);
                    } catch (UserNotFoundException e) {
                        // Should never happen, just skip this user if it does
                    }
                    ose.setDeliverTo(deliverTo);
                }
                if (deliverTo.size() > 0) {
                    ose.setDeliverTo(deliverTo);
                }
            }
            if ((ose.getActionLinks() != null) || (ose.getDeliverTo() != null)) {
                entity.setOpenSocial(ose);
            }
        }
    }

    protected void populateProvider(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("provider")) {
            ActivityObjectEntity provider = activityObjectEntityHelper.provider();
            entity.setProvider(provider);
        }
    }

    protected void populatePublished(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("published")) {
            Date published = new Date(entry.getCreationDate());
            entity.setPublished(published);
        }
    }

    protected void populateTarget(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("target")) {
            if (target instanceof StreamEntry) {
                StreamEntry se = (StreamEntry) target;
                EntityDescriptor ed = se.getTarget();
                if (ed != null) {
                    ActivityObjectEntity object = activityObjectEntityHelper.convertEntityDescriptor(ed);
                    entity.setObject(object);
                }
            } else if (target instanceof Invitation) {
                Invitation invitation = (Invitation) target;
                JiveObject place = invitation.getJiveObject();
                ActivityObjectEntity object = activityObjectEntityHelper.convertJiveObject(place);
                entity.setTarget(object);
            } else if(target instanceof UserRelationship) {
                UserRelationship relationship = (UserRelationship) target;
                try {
                    User targetUser = userManager.getUser(relationship.getRelatedUserID());
                    ActivityObjectEntity object = activityObjectEntityHelper.convertJiveObject(targetUser);
                    entity.setTarget(object);
                } catch (UserNotFoundException e) {
                    e.printStackTrace();
                }
            } else {
                // TODO - populateTarget() for non stream entries
            }
        }
    }

    protected void populateTitle(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("title")) {
            if (target instanceof StreamEntry) {
                StreamEntry se = (StreamEntry) target;
                Locale locale = localeProvider.get();
                String title = se.getActivityTitle(locale);
                entity.setTitle(title);
            } else {
                // TODO - populateTitle() for non stream entries
            }
        }
    }

    protected void populateUpdated(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        // "updated" is not supported for inbox entries
    }

    protected void populateURL(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        // "url" is not supported for inbox entries
    }

    protected void populateVerb(InboxEntry entry, ActivityEntity entity, JiveObject target) {
        if (entity.included("verb")) {
            String verb = null;
            if (target instanceof StreamEntry) {
                verb = ((StreamEntry) target).getVerb();
            }
            if (verb == null) {
                InboxEntryCustomizer customizer = customizers.get(entry.getClass());
                String verbSuffix = (customizer != null) ? customizer.getVerbSuffix(entry) : verbSuffix(entry);
                verb = "jive:" +
                        (InboxEntry.Type.action.equals(entry.getType()) ? "action:" : "notification:") +
                        verbSuffix;
            }
            entity.setVerb(verb);
        }
    }

    protected String verbSuffix(InboxEntry entry) {
        String name = entry.getClass().getSimpleName();
        if (name.endsWith("Entry")) {
            name = name.substring(0, name.length() - 5);
        }
        name = Character.toLowerCase(name.charAt(0)) + name.substring(1);
        return name;
    }

    // ----------------------------------------------------------------------------------------------------- Injectables

    protected ActivityObjectEntityHelper activityObjectEntityHelper;
    protected JiveObjectLoader jiveObjectLoader;
    protected JiveObjectProvider jiveObjectProvider;
    protected LocaleProvider localeProvider;
    protected Map<Class, InboxEntryCustomizer> customizers;
    protected UserManager userManager;

    @Required
    public void setActivityObjectEntityHelper(ActivityObjectEntityHelper activityObjectEntityHelper) {
        this.activityObjectEntityHelper = activityObjectEntityHelper;
    }

    @Required
    public void setCustomizers(List<InboxEntryCustomizer> customizers) {
        this.customizers = new HashMap();
        for (InboxEntryCustomizer customizer : customizers) {
            this.customizers.put(customizer.getCustomizedClass(), customizer);
        }
    }

    @Required
    public void setJiveObjectLoader(JiveObjectLoader jiveObjectLoader) {
        this.jiveObjectLoader = jiveObjectLoader;
    }

    @Required
    public void setJiveObjectProvider(JiveObjectProvider jiveObjectProvider) {
        this.jiveObjectProvider = jiveObjectProvider;
    }

    @Required
    public void setLocaleProvider(LocaleProvider localeProvider) {
        this.localeProvider = localeProvider;
    }

    @Required
    public void setUserManager(UserManager userManager) {
        this.userManager = userManager;
    }

}
