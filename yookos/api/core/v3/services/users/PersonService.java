package com.yookos.api.core.v3.services.users;

/**
 * Created with IntelliJ IDEA.
 * Edited By: Emile Senga
 * Date: 5/29/13
 * Time: 6:46 AM
 *
 * Methods that have been edited or newly created are marked as such.
 */

import com.gigya.api.GigyaApi;
import com.gigya.socialize.GSKeyNotFoundException;
import com.gigya.socialize.GSRequest;
import com.gigya.socialize.GSResponse;
import com.gigya.socialize.SigUtils;
import com.gigya.util.GigyaUtils;
import com.google.common.collect.*;
import com.jivesoftware.api.core.aaa.RequiresAuthentication;
import com.jivesoftware.api.core.entities.CoreAttachment;
import com.jivesoftware.api.core.v3.converters.PlaceEntityConverter;
import com.yookos.api.core.v3.converters.communications.ToDoActivityEntityConverter;
import com.jivesoftware.api.core.v3.documentation.Retrieves;
import com.jivesoftware.api.core.v3.entities.*;
import com.jivesoftware.api.core.v3.entities.activity.ActivityEntity;
import com.jivesoftware.api.core.v3.entities.activity.StreamEntity;
import com.jivesoftware.api.core.v3.entities.communications.ToDoEntity;
import com.jivesoftware.api.core.v3.entities.content.ProfileImageEntity;
import com.jivesoftware.api.core.v3.entities.metadata.FieldEntity;
import com.jivesoftware.api.core.v3.entities.metadata.ObjectEntity;
import com.jivesoftware.api.core.v3.entities.metadata.ResourceEntity;
import com.jivesoftware.api.core.v3.entities.places.BlogEntity;
import com.jivesoftware.api.core.v3.entities.places.GroupEntity;
import com.jivesoftware.api.core.v3.entities.users.PersonEntity;
import com.jivesoftware.api.core.v3.exceptions.*;
import com.jivesoftware.api.core.v3.exceptions.NotFoundException;
import com.jivesoftware.api.core.v3.js.JSName;
import com.jivesoftware.api.core.v3.js.ParamOverride;
import com.jivesoftware.api.core.v3.js.StaticJavaScriptMethod;
import com.jivesoftware.api.core.v3.js.StaticJavaScriptMethods;
import com.jivesoftware.api.core.v3.providers.activity.ActivityProvider;
import com.jivesoftware.api.core.v3.providers.activity.StreamProvider;
import com.jivesoftware.api.core.v3.providers.communications.ActionProvider;
import com.jivesoftware.api.core.v3.providers.content.CommonContentProvider;
import com.jivesoftware.api.core.v3.providers.content.ContentProvider;
import com.jivesoftware.api.core.v3.providers.content.ProfileImageProvider;
import com.jivesoftware.api.core.v3.providers.places.InviteProvider;
import com.jivesoftware.api.core.v3.providers.users.PersonProvider;
import com.jivesoftware.api.core.v3.services.AbstractService;
import com.jivesoftware.api.core.v3.services.places.InviteService;
import com.jivesoftware.api.core.v3.util.Paginator;
import com.jivesoftware.base.*;
import com.jivesoftware.base.util.UserPermHelper;
import com.jivesoftware.community.*;
import com.jivesoftware.community.aaa.AnonymousUser;
import com.jivesoftware.community.aaa.JiveUserAuthentication;
import com.jivesoftware.community.aaa.authz.SudoExecutor;
import com.jivesoftware.community.action.EditProfileAction;
import com.jivesoftware.community.action.util.JiveTextProvider;
import com.jivesoftware.community.action.util.RenderUtils;
import com.jivesoftware.community.browse.BrowseManager;
import com.jivesoftware.community.browse.filter.BrowseFilter;
import com.jivesoftware.community.browse.filter.MemberFilter;
import com.jivesoftware.community.browse.rest.impl.ItemsViewBean;
import com.jivesoftware.community.browse.rest.impl.PlaceItemBean;
import com.jivesoftware.community.browse.sort.ModificationDateSort;
import com.jivesoftware.community.browse.util.CastingIterator;
import com.jivesoftware.community.eae.mail.NotificationSettingsManager;
import com.jivesoftware.community.eae.mail.dao.NotificationSettingsBean;
import com.jivesoftware.community.eae.rest.ActivityStreamService;
import com.jivesoftware.community.eae.rest.StreamConfigurationService;
import com.jivesoftware.community.eae.rest.impl.StreamAssociationManagementBean;
import com.jivesoftware.community.eae.util.StreamHelper;
import com.jivesoftware.community.eae.view.stream.configuration.StreamAssociationBean;
import com.jivesoftware.community.eae.view.stream.configuration.StreamConfigurationRequest;
import com.jivesoftware.community.event.browser.BrowserEventManager;
import com.jivesoftware.community.event.browser.view.BrowserEventBundle;
import com.jivesoftware.community.inbox.InboxEntry;
import com.jivesoftware.community.inbox.InboxManager;
import com.jivesoftware.community.inbox.entry.UserRelationshipApprovalEntry;
import com.jivesoftware.community.lifecycle.JiveApplication;
import com.jivesoftware.community.microblogging.WallEntryManager;
import com.jivesoftware.community.places.rest.ContainerService;
import com.jivesoftware.community.profile.TempImage;
import com.jivesoftware.community.renderer.RenderManager;
import com.jivesoftware.community.renderer.impl.v2.JAXPUtils;
import com.jivesoftware.community.socialgroup.SocialGroup;
import com.jivesoftware.community.socialgroup.SocialGroupManager;
import com.jivesoftware.community.user.profile.ProfileField;
import com.jivesoftware.community.user.profile.ProfileFieldManager;
import com.jivesoftware.community.user.profile.ProfileFieldValue;
import com.jivesoftware.community.user.profile.ProfileManager;
import com.jivesoftware.community.user.profile.security.ProfileSecurityLevel;
import com.jivesoftware.community.user.profile.security.ProfileSecurityLevelView;
import com.jivesoftware.community.user.profile.security.ProfileSecurityManager;
import com.jivesoftware.community.user.relationships.MeshUserRelationshipGraph;
import com.jivesoftware.community.user.relationships.UserRelationship;
import com.jivesoftware.community.user.relationships.UserRelationshipManager;
import com.jivesoftware.community.util.TermsAndConditionsHelper;
import com.jivesoftware.util.LocaleUtils;
import com.jivesoftware.util.SupportedImageFileTypes;
import com.newrelic.api.agent.Trace;
import com.yookos.util.EmailValidator;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.cxf.jaxrs.ext.multipart.MultipartBody;
import org.apache.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Required;

import javax.activation.MimetypesFileTypeMap;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.io.*;
import java.net.URI;
import java.security.InvalidKeyException;
import java.util.*;
import java.util.concurrent.Callable;

/**
 * <p>REST endpoint for interacting with Jive users via an API that is compatible with OpenSocial.</p>
 */
@Path("/people")
@Produces("application/json")
public class PersonService extends AbstractService {

    public static final int MAX_CROP_WIDTH = 500;
    public static final int MAX_CROP_HEIGHT = 375;
    protected final static String IMAGE_TYPE_NOT_SUPPORTED = "The uploaded image type is not supported.";
    protected final static String UPLOAD_ERROR = "An Error occured while uploading the Avatar. Please try again later.";
    protected final static String IMAGE_READ_ERROR = "An Error occured while reading the Avatar Image";

    // -------------------------------------------------------------------------------------------------- Public Methods
    protected final static String IMAGE_TOO_BIG_ERROR = "The uploaded image is too large";
    protected final static String EXCEEDED_AVATAR_UPLOADS = "The user has exceeded the number of uploads allowed.";
    protected static final MimetypesFileTypeMap typeMap = new MimetypesFileTypeMap();
    // Error codes
    private static final String UNSUPPORTED_OPERATION = "peopleUnsupportedOperation";
    private static final String GIGYA_CID = "api.core.v3";
    private static final String IS_MOBILE_NOTIFICAITON_ENABLED = "user.mobile.notification.enabled";
    private static String API_KEY = "3_zic8hh2F-B0zdlQVXxrQGPsDy_L3qxHRv8GCflsm1zuFhf1KtpM7zdJ1z-Dstr0D";
    private static String SECRET_KEY = "Z/2YhJB8npBlc3xMFVZYn+vMnXOAt5FkRUMqccpFc3U=";
    public Logger log = Logger.getLogger(PersonService.class);
    protected StreamHelper streamHelper;
    protected AvatarManager avatarManager;
    protected ImageManager imageManager;
    protected String[] supportedFileTypeNames;
    protected StreamConfigurationService streamConfigurationService;
    protected ActivityProvider activityProvider;
    protected CommonContentProvider commonContentProvider;
    protected PersonProvider personProvider;
    protected ProfileImageProvider profileImageProvider;
    protected StreamProvider streamProvider;
    protected GigyaApi gigyaApi;
    InviteService inviteService;
    InviteProvider inviteProvider;
    ContainerService containerServiceImpl;	//container service to get users groups
    PlaceEntityConverter<JiveContainer, PlaceEntity> placeEntityConverter;
    PlaceEntityConverter<JiveContainer, GroupEntity> groupEntityConverter;
    JiveContainerManagerImpl containerManager;
    private BrowserEventManager browserEventManager;
    private NotificationSettingsManager notificationSettingsManager;
    private File imageDir;
    private TermsAndConditionsHelper termsAndConditionsHelper;
    private RegistrationManager registrationManager;
    private RenderManager globalRenderManager;
    private UserManager userManager;
    private UserRelationshipManager userRelationshipManager;
    private InboxManager inboxManager;

    private static List<String> convertStringToList(String data) {
        if(null == data || data.isEmpty())
            return null;

        return Arrays.asList(data.split("\\|"));
    }

    private static String convertListToString(List<String> data) {
        StringBuffer buffer = new StringBuffer("");

        int i = 0;
        while (i < data.size() - 1) {
            buffer.append(data.get(i) + "|");
            i++;
        }

        buffer.append(data.get(data.size() - 1));
        return buffer.toString();
    }

    // -------------------------------------------------------------------------------------------- Gigya Access Methods

    private static boolean isValidSignature(String timestamp, String UID, String key, String signature) throws InvalidKeyException, UnsupportedEncodingException {
        return SigUtils.validateUserSignature(UID, timestamp, key, signature);
    }

    public static String getAPI_KEY() {
        return API_KEY;
    }

    public static void setAPI_KEY(String API_KEY) {
        PersonService.API_KEY = API_KEY;
    }

    public static String getSECRET_KEY() {
        return SECRET_KEY;
    }

    public static void setSECRET_KEY(String SECRET_KEY) {
        PersonService.SECRET_KEY = SECRET_KEY;
    }

    /**
     * <p>Return a paginated list of {@link com.jivesoftware.api.core.v3.entities.users.PersonEntity Persons} for users that match the specified criteria.
     *
     * <p>This service supports the following filters. Parameters, when used, should be
     * wrapper in parenthesis. See the examples for clarification.</p>
     * <table class="refTable">
     *     <thead>
     *         <tr><th>Filter</th><th>Params</th><th>Example</th></tr>
     *     </thead>
     *     <tbody>
     *         <tr><td>tag</td><td>Many values separated by commas</td><td>?filter=tag(sales,performance)</td></tr>
     *         <tr><td>title</td><td>Single value</td><td>?filter=title(Territory%2BSales%2BManager)</td></tr>
     *         <tr><td>department</td><td>Single value</td><td>?filter=department(Engineering)</td></tr>
     *         <tr><td>hire-date</td><td>Beginning and end dates separated by commas. Dates use GMT timezone and are
     *         ISO-8601 compliant</td><td>?filter=hire-date(2012-01-31T22:46:12.044%2B0000,
     *         2012-12-03T22:46:12.044%2B0000)</td></tr>
     *         <tr><td>location</td><td>Single value</td><td>?filter=location(Portland)</td></tr>
     *         <tr><td>company</td><td>Single value</td><td>?filter=company(Jive)</td></tr>
     *         <tr><td>office</td><td>Single value</td><td>?filter=office(PDX)</td></tr>
     *     </tbody>
     * </table>
     *
     * <p>This service supports the following sort types.</p>
     * <table class="refTable">
     *     <thead>
     *         <tr><th>Sort</th><th>Description</th></tr>
     *     </thead>               lulz
     *     <tbody>
     *         <tr><td>firstNameAsc</td><td>Sort by first name in ascending order</td></tr>
     *         <tr><td>lastNameAsc</td><td>Sort by last name in ascending order</td></tr>
     *         <tr><td>dateJoinedDesc</td><td>Sort by joined date in ascending order</td></tr>
     *         <tr><td>dateJoinedAsc</td><td>Sort by joined date in descending order</td></tr>
     *         <tr><td>statusLevelDesc</td><td>Sort by status level in descending order</td></tr>
     *     </tbody>
     * </table>
     *
     * @param ids Person IDs (comma delimited) of the individual people to be returned
     * @param query Query string containing search terms (or <code>null</code> for no search criteria)
     * @param startIndex Zero-relative index of the first instance to be returned
     * @param count Maximum number of instances to be returned (i.e. the page size)
     * @param fields Fields to be returned (or <code>null</code> for summary fields)
     * @param filters Optional set of filter expressions to select the returned objects
     * @param sort Optional sort to apply to the search results.
     *
     * @exception com.jivesoftware.api.core.v3.exceptions.OK Request was successful
     * @exception com.jivesoftware.api.core.v3.exceptions.BadRequestException The request criteria are malformed
     * @exception com.jivesoftware.api.core.v3.exceptions.ForbiddenException The requesting user is not authorize to retrieve this user information
     */
//     *         <tr><td>include-disabled</td><td>No params</td><td>?filter=include-disabled</td></tr>
    @GET
    @Path("/")
    @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.get")
    @Trace
    public Entities<PersonEntity> getPeople(@QueryParam("ids") String ids,
                                            @QueryParam("query") String query,
                                            @QueryParam("startIndex") @DefaultValue("0") int startIndex,
                                            @QueryParam("count") @DefaultValue("25") int count,
                                            @QueryParam("fields") @DefaultValue(PersonEntity.SUMMARY_FIELDS) String fields,
                                            @QueryParam("filter") List<String> filters,
                                            @QueryParam("sort") @DefaultValue("firstNameAsc") String sort)
            throws BadRequestException, ForbiddenException
    {
        List<PersonEntity> entities = personProvider.getPeople(ids, query, startIndex, count, fields, filters, sort);
        Paginator paginator = paginationHelper.getPaginator(startIndex, count, null);
        ImmutableMultimap.Builder<String, String> parameterBuilder = ImmutableMultimap.builder();
        addQueryParam("query", query, parameterBuilder);
        addQueryParam("sort", sort, parameterBuilder);
        addQueryParam("fields", fields, parameterBuilder);
        addQueryParam("filter", filters, parameterBuilder);
        return attachPagination(paginator, entities, parameterBuilder.build());
    }

    /**
     * <p>Create a {@link PersonEntity} for a new user based on the contents of the specified
     * {@link PersonEntity}.  Only modifiable fields that actually provide a value in the incoming
     * entity are processed.
     * </p>
     *
     * <p>The JSON representation of the absolute minimum information that must be included to
     * create a new person looks like this:</p>
     * <pre>
     *     {
     *         "emails" : [ {
     *             "value" : "{emailAddress}",
     *             "type" : "work",
     *             "primary" : true,
     *             "jive_label" : "Email"
     *         } ],
     *         "jive" : {
     *             "password" : "{password}",
     *             "username" : "{username}"
     *         },
     *         "name" : {
     *             "familyName" : "{lastName}",
     *             "givenName" : "{firstName}"
     *         }
     *     }
     * </pre>
     *
     * @param personEntity {@link PersonEntity} containing information describing the new user
     * @param fields The fields to include in the returned entity
     *
     * @exception com.jivesoftware.api.core.v3.exceptions.Created Request was successful
     * @exception BadRequestException Any of the input fields are malformed
     * @exception com.jivesoftware.api.core.v3.exceptions.ConflictException The requested change would cause business rules to be violated
     *  (such as more than one user with the same email address)
     * @exception ForbiddenException The requesting user is not authorized to make changes to the specified user
     * @exception com.jivesoftware.api.core.v3.exceptions.NotFoundException The specified user does not exist
     * @exception com.jivesoftware.api.core.v3.exceptions.NotImplementedException User creation is not supported in this Jive instance
     */
    @POST
    @Path("/")
    @Consumes("application/json")
    @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.create")
    @RequiresAuthentication
    @Retrieves(PersonEntity.class)
    @Trace
    public Response createPerson(PersonEntity personEntity,
                                 @QueryParam("fields") @DefaultValue(PersonEntity.ALL_FIELDS) String fields)
            throws BadRequestException, ConflictException, ForbiddenException, NotFoundException, NotImplementedException
    {
        personEntity = personProvider.createPerson(personEntity, fields);
        Resource self = personEntity.getResources().get("self");
        return Response.created(self.getRef())
                .entity(personEntity)
                .build();
    }

    /**
     * <p>Return metadata about our data object type in this Jive instance.</p>
     *
     * @retrieves {@link com.jivesoftware.api.core.v3.entities.metadata.ObjectEntity}
     * @exception OK Request was successful
     */
    @GET
    @Path("/@metadata")
    @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.getMetadata")
    @Trace
    public ObjectEntity getMetadata() {
        ObjectEntity metadata = objectMetadataProvider.getObject(PersonEntity.OBJECT_TYPE);
        return metadata;
    }

    /**
     * <p>Return metadata about the resources available for our data object type in this Jive instance.</p>
     *
     * @retrieves {@link com.jivesoftware.api.core.v3.entities.metadata.ResourceEntity}[]
     */
    @GET
    @Path("/@resources")
    @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.getResources")
    @Trace
    public List<ResourceEntity> getResources() {
        ObjectEntity metadata = objectMetadataProvider.getObject(PersonEntity.OBJECT_TYPE);
        if (metadata.getResourceLinks() != null) {
            return metadata.getResourceLinks();
        }
        else {
            return Lists.newArrayList();
        }
    }

    /**                                                                                  A
     * <p>Return the set of fields that can be used for filtering users in this Jive instance.</p>
     *
     * @retrieves {@link String}[]
     */
    @GET
    @Path("/@filterableFields")
    @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.getFilterableFields")
    @Trace
    public Set<String> getFilterableFields() {
        Set<String> results = personProvider.getFilterableFields();
        return results;
    }

    /**
     * <p>Return the set of fields for our object type that are supported in this Jive instance.</p>
     *
     * @retrieves {@link String}[]
     */
    @GET
    @Path("/@supportedFields")
    @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.getSupportedFields")
    @Trace
    public Set<String> getSupportedFields() {
        Set<String> results = Sets.newHashSet();
        ObjectEntity metadata = objectMetadataProvider.getObject(PersonEntity.OBJECT_TYPE);
        for (FieldEntity field : metadata.getFields()) {
            if (!field.getUnpublished()) {
                results.add(field.getName());
            }
        }
        return results;
    }

    /**
     * <p>Return a {@link PersonEntity} describing the requested Jive user by email address.</p>
     *
     * @param email Email address of the requested Jive user
     * @param fields Field names to be returned (default is @all)
     *
     * @retrieves {@link PersonEntity}
     * @exception OK Request was successful
     * @exception BadRequestException if the specified email address is malformed
     * @exception ForbiddenException if the requesting user is not authorized to retrieve this user
     * @exception NotFoundException if the id does not identify a valid user
     */
    @GET
    @Path("/email/{email}")
    @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.get")
    @Trace
    public PersonEntity getPersonByEmail(@PathParam("email") String email,
                                         @QueryParam("fields") String fields)
            throws BadRequestException, ForbiddenException, NotFoundException
    {
        PersonEntity entity = personProvider.getPersonByEmail(email, fields);
        return entity;
    }

    /**
     * <p>Return a {@link PersonEntity} describing the requested Jive user by username.</p>
     *
     * @param username Username of the requested Jive user
     * @param fields Field names to be returned (default is all)
     *
     * @retrieves {@link PersonEntity}
     * @exception OK Request was successful
     * @exception BadRequestException The specified email address is malformed
     * @exception ForbiddenException The requesting user is not authorized to retrieve this user
     * @exception NotFoundException The id does not identify a valid user
     */
    @GET
    @Path("/username/{username}")
    @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.get")
    @Trace
    public PersonEntity getPersonByUsername(@PathParam("username") String username,
                                            @QueryParam("fields") String fields)
            throws BadRequestException, ForbiddenException, NotFoundException
    {
        PersonEntity entity = personProvider.getPersonByUsername(username, fields);
        return entity;
    }

    /**
     * <p>Trigger a background task to delete the specified person, and all of their content.  Returns
     * an HTTP 202 (Accepted) status to indicate the the deletion request has been accepted.  The only
     * way that a client can tell it has been completed is by trying a GET on the person URI, and waiting
     * until a NotFoundException is returned.</p>
     *
     * <p><strong>WARNING</strong> - It is possible that errors during the deletion process might cause
     * the delete to be abandoned.</p>
     *
     * @param personID ID of the person to be deleted
     * @param uriInfo Information about the request URI for this request (supplied automatically by the system)
     *
     * @exception Accepted A background task has been queued to delete the specified person.
     * @exception BadRequestException The specified id is malformed
     * @exception ForbiddenException The requesting user is not authorized to delete this user (Jive admin only)
     * @exception NotFoundException The id does not identify a valid user
     * @exception NotImplementedException User deletion is not supported in this Jive instance
     */
    @DELETE
    @Path("/{personID}")
    @RequiresAuthentication
    @Trace
    @Retrieves(Void.class)
    public Response deletePerson(@PathParam("personID") @JSName("id") String personID,
                                 @Context UriInfo uriInfo)
            throws BadRequestException, ForbiddenException, NotFoundException, NotImplementedException {
        personProvider.deletePerson(personID);
        Response response = Response.status(Response.Status.ACCEPTED)
                .header("Location", uriInfo.getRequestUri().toString())
                .build();
        return response;
    }

    /**
     * <p>Return a {@link PersonEntity} describing the requested Jive user by ID.</p>
     *
     * @param personID ID of the requested Jive user
     * @param fields Field names to be returned (default is all)
     *
     * @retrieves {@link PersonEntity}
     * @exception OK Request was successful
     * @exception BadRequestException The specified id is malformed
     * @exception ForbiddenException The requesting user is not authorized to retrieve this user
     * @exception NotFoundException The id does not identify a valid user
     */
    @GET
    @Path("/{personID}")
    @StaticJavaScriptMethods({
            @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.get", optionsInterceptor = "parseIdFromURI"),
            @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.getViewer",
                    override = {@ParamOverride(name = "id", value = "@me")}),
            @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.getOwner",
                    override = {@ParamOverride(name = "id", value = "@me")})
    })
    @Trace
    public PersonEntity getPerson(@PathParam("personID") @JSName("uri") String personID,
                                  @QueryParam("fields") String fields)
            throws BadRequestException, ForbiddenException, NotFoundException
    {
        PersonEntity entity = personProvider.getPerson(personID, fields);
        return entity;
    }

    /**
     * <p>Update the specified user based on the contents of the specified {@link PersonEntity}.
     * Only modifiable fields that actually provide a value in the incoming entity are processed.
     * Then, return a {@link PersonEntity} reflecting the processed changes.</p>
     *
     * @param personID ID of the user to be updated
     * @param personEntity {@link PersonEntity} containing our update information
     *
     * @retrieves {@link PersonEntity}
     * @exception OK Request was successful
     * @exception BadRequestException Any of the input fields are malformed
     * @exception ConflictException Requested change would cause business rules to be violated
     *  (such as more than one user with the same email address)
     * @exception ForbiddenException The requesting user is not authorized to make changes to the specified user
     * @exception NotFoundException The specified user does not exist
     */
    @PUT
    @Path("/{personID}")
    @RequiresAuthentication
    @Trace
    public PersonEntity updatePerson(@PathParam("personID") String personID, PersonEntity personEntity)
            throws BadRequestException, ConflictException, ForbiddenException, NotFoundException
    {
        personEntity = personProvider.updatePerson(personID, personEntity);
        return personEntity;
    }

    /**
     * <p>Return the specified profile activities for the specified user.</p>
     *
     * @param personID ID of the user for which to return profile activities
     * @param after Date and time representing the minimum "last activity in a collection"
     *              timestamp for selecting activities  (cannot specify both after and before)
     * @param before Date and time representing the maxium "last activity in a collection"
     *               timestamp for selecting activities  (cannot specify both after and before)
     * @param count Maximum number of activities to return in this request
     *              (you may get more activities than this in order to get all of
     *              the activities in the last collection)
     * @param fields Fields to be included in the returned activities
     *
     * @retrieves {@link com.jivesoftware.api.core.v3.entities.activity.ActivityEntity}[]
     * @exception BadRequestException The specified user ID is missing or malformed
     * @exception ForbiddenException The requesting user is not allowed to retrieve activities for the specified user
     * @exception NotFoundException The activities or the specified user is not found
     */
    @GET
    @Path("/{personID}/activities")
    @Trace
    public Entities<ActivityEntity> getActivity(@PathParam("personID") String personID,
                                                @QueryParam("after") String after,
                                                @QueryParam("before") String before,
                                                @QueryParam("count") @DefaultValue("25") int count,
                                                @QueryParam("fields") @DefaultValue(ActivityEntity.ALL_FIELDS) String fields)
            throws BadRequestException, ForbiddenException, NotFoundException
    {
        User person = personProvider.validatePerson(personID);
        Paginator paginator = paginationHelper.getPaginator(count, after, before, "jive.collectionUpdated", true);
        List<ActivityEntity> entities = activityProvider.getActivity(person, paginator, fields);
        ImmutableMultimap.Builder<String, String> parameterBuilder = ImmutableMultimap.builder();
        addQueryParam("fields", fields, parameterBuilder);
        return attachPagination(paginator, entities, parameterBuilder.build());

    }

    /**
     * <p>Return the binary content of the avatar image for the specified user.</p>
     *
     * @param personID ID of the user for which to return an avatar
     *
     * @retrieves Binary content of the avatar image
     * @exception OK Request was successful
     * @exception BadRequestException The specified user ID is missing or malformed
     * @exception ForbiddenException The requesting user is not allowed to retrieve the avatar for the specified user
     * @exception InternalServerErrorException A processing error occurs accessing the avatar image
     * @exception NotFoundException The avatar image for the specified user is not found
     */
    @GET
    @Path("/{personID}/avatar")
    @Produces({"application/octet-stream", "application/json"})
    @Trace
    public Response getAvatar(@PathParam("personID") String personID)
            throws BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException
    {
        try {
            CoreAttachment attachment = personProvider.getAvatar(personID);
            return response(attachment);
        }
        catch (AttachmentNotFoundException e) {
            throw coreErrorBuilder.notFoundException("api.core.v3.error.missing_avatar", e, personID)
                    .build();
        }
        catch (IOException e) {
            throw coreErrorBuilder.internalServerErrorException("api.core.v3.error.missing_avatar", e, personID)
                    .build();
        }
    }

    // -------------------------------------------------------------------------------------------- Add remove friends

    /**
     * <p>Return a paginated list of {@link PersonEntity}s about colleagues of the specified person
     * (i.e. those who report to the same manager that this person does).</p>
     *
     * @param personID ID of the specified Jive user
     * @param startIndex Zero-relative index of the first instance to be returned
     * @param count Maximum number of instances to be returned (i.e. the page size)
     * @param fields Fields to be returned (or <code>null</code> for summary fields)
     *
     * @retrieves {@link PersonEntity}[] listing the colleagues of the specified user
     * @exception OK Request was successful
     * @exception BadRequestException The request criteria are malformed
     * @exception ForbiddenException The requesting user is not authorize to retrieve this user information
     * @exception GoneException Organization Chart relationships are not supported by this Jive instance
     * @exception NotFoundException The specified user cannot be found
     */
    @GET
    @Path("/{personID}/@colleagues")
    @Trace
    public Entities<PersonEntity> getColleagues(@PathParam("personID") String personID,
                                                @QueryParam("startIndex") @DefaultValue("0") int startIndex,
                                                @QueryParam("count") @DefaultValue("25") int count,
                                                @QueryParam("fields") @DefaultValue(PersonEntity.SUMMARY_FIELDS) String fields)
            throws BadRequestException, ForbiddenException, GoneException, NotFoundException
    {
        List<PersonEntity> entities = personProvider.getColleagues(personID, startIndex, count, fields);
        Paginator paginator = paginationHelper.getPaginator(startIndex, count, null);
        ImmutableMultimap.Builder<String, String> parameterBuilder = ImmutableMultimap.builder();
        addQueryParam("fields", fields, parameterBuilder);
        return attachPagination(paginator, entities, parameterBuilder.build());
    }

    /**
     * <p>Return a paginated list of {@link PersonEntity}s about people who are following
     * the specified person.</p>
     *
     * @param personID ID of the specified person
     * @param startIndex Zero-relative index of the first instance to be returned
     * @param count Maximum number of instances to be returned (i.e. the page size)
     * @param fields Fields to be returned (or <code>null</code> for summary fields)
     *
     * @retrieves {@link PersonEntity} listing people following the specified person
     * @exception OK Request was successful
     * @exception BadRequestException The request criteria are malformed
     * @exception ForbiddenException The requesting user is not authorize to retrieve this user information
     * @exception NotFoundException The specified user cannot be found
     */
    @GET
    @Path("/{personID}/@followers")
    @Trace
    public Entities<PersonEntity> getFollowers(@PathParam("personID") String personID,
                                               @QueryParam("startIndex") @DefaultValue("0") int startIndex,
                                               @QueryParam("count") @DefaultValue("25") int count,
                                               @QueryParam("fields") @DefaultValue(PersonEntity.SUMMARY_FIELDS) String fields)
            throws BadRequestException, ForbiddenException, NotFoundException
    {
        List<PersonEntity> entities = personProvider.getFollowers(personID, startIndex, count, fields);
        Paginator paginator = paginationHelper.getPaginator(startIndex, count, null);
        ImmutableMultimap.Builder<String, String> parameterBuilder = ImmutableMultimap.builder();
        addQueryParam("fields", fields, parameterBuilder);
        return attachPagination(paginator, entities, parameterBuilder.build());
    }

    /**
     * <p>Return a paginated list of {@link PersonEntity}s about people the specified person
     * is following.</p>
     *
     * @param personID ID of the specified person
     * @param startIndex Zero-relative index of the first instance to be returned
     * @param count Maximum number of instances to be returned (i.e. the page size)
     * @param fields Fields to be returned (or <code>null</code> for summary fields)
     *
     * @retrieves {@link PersonEntity} listing people the specified person is following
     * @exception OK Request was successful
     * @exception BadRequestException The request criteria are malformed
     * @exception ForbiddenException The requesting user is not authorize to retrieve this user information
     * @exception NotFoundException The specified user cannot be found
     */
    @GET
    @Path("/{personID}/@following")
    @Trace
    public Entities<PersonEntity> getFollowing(@PathParam("personID") String personID,
                                               @QueryParam("startIndex") @DefaultValue("0") int startIndex,
                                               @QueryParam("count") @DefaultValue("25") int count,
                                               @QueryParam("fields") @DefaultValue(PersonEntity.SUMMARY_FIELDS) String fields)
            throws BadRequestException, ForbiddenException, NotFoundException
    {
        List<PersonEntity> entities = personProvider.getFollowing(personID, startIndex, count, fields);
        Paginator paginator = paginationHelper.getPaginator(startIndex, count, null);
        ImmutableMultimap.Builder<String, String> parameterBuilder = ImmutableMultimap.builder();
        addQueryParam("fields", fields, parameterBuilder);
        return attachPagination(paginator, entities, parameterBuilder.build());
    }



    // --------------------------------------------------------------------------------------------  Invitie your friends services

    /**
     * <p>Delete a following relationship between the specified user and the specified followed user.</p>
     *
     * @param personID ID of the user who is following
     * @param followedPersonID the id of the user who is followed
     *
     * @exception NoContent Request was successful
     * @exception ConflictException if a following relationship does not exist between these two users
     * @exception ForbiddenException if the requesting user is not allowed to delete this relationship
     * @exception NotFoundException if one or both of the specified users cannot be found
     */
    @DELETE
    @Path("/{personID}/@following/{followedPersonID}")
    @Trace
    public void deleteFollowing(@PathParam("personID") String personID,
                                @PathParam("followedPersonID") String followedPersonID)
            throws ConflictException, ForbiddenException, NotFoundException
    {
        personProvider.deleteFollowing(personID, followedPersonID);
    }

    /**
     * <p>Return a {@link PersonEntity} describing the followed person, if a following relationship from the
     * specified person exists.</p>
     *
     * @param personID ID of the specified person
     * @param followedPersonID ID of the followed person (if any)
     * @param fields Fields to be returned (or <code>null</code> for all fields)
     *
     * @retrieves {@link PersonEntity} describing the followed person
     * @exception OK Request was successful
     * @exception BadRequestException No following relationship exists between these two people
     * @exception ForbiddenException The requesting user is not authorized to retrieve this user information
     * @exception NotFoundException Either user cannot be found
     */
    @GET
    @Path("/{personID}/@following/{followedPersonID}")
    @Trace
    public PersonEntity getFollowingPerson(@PathParam("personID") String personID,
                                           @PathParam("followedPersonID") String followedPersonID,
                                           @QueryParam("fields") String fields)
            throws BadRequestException, ForbiddenException, NotFoundException
    {
        PersonEntity entity = personProvider.getFollowing(personID, followedPersonID, fields);
        return entity;
    }

    /**
     * <p>Create a following relationship between the specified user and the specified followed user.</p>
     *
     * @param personID ID of the user who will be following
     * @param followedPersonID ID of the user who will be followed
     *
     * @exception NoContent Request was successful
     * @exception ConflictException A following relationship already exists between these two users
     * @exception ForbiddenException The requesting user is not allowed to create this relationship
     * @exception NotFoundException One or both of the specified users cannot be found
     */
    @PUT
    @Path("/{personID}/@following/{followedPersonID}")
    @Trace
    public void createFollowing(@PathParam("personID") String personID,
                                @PathParam("followedPersonID") String followedPersonID)
            throws ConflictException, ForbiddenException, NotFoundException
    {
        personProvider.createFollowing(personID, followedPersonID);

        User following = null;
        User followed = null;
        try {
            following = userManager.getUser(Long.valueOf(personID));
            followed = userManager.getUser(Long.valueOf(followedPersonID));
        } catch (UserNotFoundException e) {
            e.printStackTrace();
        }

        MeshUserRelationshipGraph graph = userRelationshipManager.getDefaultMeshRelationshipGraph();
        UserRelationship rel = userRelationshipManager.getFriendRelationship(following, followed, graph);
        rel.setRelationshipState(UserRelationship.RelationshipState.PENDING_APPROVAL);

        userRelationshipManager.updateRelationship(rel);
    }

    /**
     * <p>Create a personal {@link com.jivesoftware.api.core.v3.entities.content.TaskEntity}.
     * </p>
     *
     * <p>The JSON representation of the absolute minimum information that must be included to
     * create a new personal task looks like this:</p>
     * <pre>
     * {
     *  "subject": "Clean the carpet",
     *  "dueDate" : "2013-07-12T06:59:59.999+0000",
     *  "type": "task"
     * }
     * </pre>
     *
     * @param personID ID of the user for which to create a task
     * @param entity {@link com.jivesoftware.api.core.v3.entities.content.TaskEntity} containing information
     *                                                                               describing the new personal task
     * @param fields Fields to include in the returned {@link com.jivesoftware.api.core.v3.entities.content.TaskEntity}
     *
     * @exception Created Request was successful
     * @exception BadRequestException Any of the input fields are malformed
     * @exception ConflictException The new entity would conflict with system restrictions
     *  (such as two contents of the same type with the same name)
     * @exception ForbiddenException You are not allowed to access the specified content
     * @since 3.1
     */
    @POST
    @Path("/{personID}/tasks")
    @RequiresAuthentication
    @Consumes("application/json")
    @Trace
    public Response createTask(@PathParam("personID") String personID,
                               String entity,
                               @QueryParam("fields") @DefaultValue(Entity.ALL_FIELDS) String fields)
            throws BadRequestException, ConflictException, ForbiddenException
    {
        try {
            JSONObject object = new JSONObject(entity);
            object.put("parent", servicePathProvider.servicePath(this.getClass(), "getPerson", personID).toString());
            String type = commonContentProvider.validateContentType(object);
            ContentProvider<JiveContentObject, ContentEntity> contentProvider =
                    commonContentProvider.validateContentProvider(type);
            Response response = contentProvider.createContent(object, null, fields);
            return response;
        }
        catch (JSONException e) {
            throw coreErrorBuilder.badRequestException(e)
                    .build();
        }
    }

    /**
     * <p>Return a paginated list of personal tasks for the specified person.</p>
     *
     * <p>This service supports the following sort types.</p>
     *
     * <table class="refTable">
     *     <thead>
     *         <tr>
     *             <th>Sort</th>
     *             <th>Description</th>
     *         </tr>
     *     </thead>
     *     <tbody>
     *         <tr>
     *             <td>dateCreatedAsc</td>
     *             <td>Sort by the date this content object was created, in ascending order</td>
     *         </tr>
     *         <tr>
     *             <td>dateCreatedDesc</td>
     *             <td>Sort by the date this content object was created, in descending order. Default if none was specified.</td>
     *         </tr>
     *         <tr>
     *             <td>latestActivityAsc</td>
     *             <td>Sort by the date this content object had the most recent activity, in ascending order</td>
     *         </tr>
     *         <tr>
     *             <td>latestActivityDesc</td>
     *             <td>Sort by the date this content object had the most recent activity, in descending order</td>
     *         </tr>
     *         <tr>
     *             <td>titleAsc</td>
     *             <td>Sort by content object subject, in ascending order</td>
     *         </tr>
     *     </tbody>
     * </table>
     *
     * @param personID ID of the specified Jive user
     * @param startIndex Zero-relative index at which to start results
     * @param count Maximum number of places to be returned
     * @param fields Fields to be included in the returned entities
     * @param sort Requested sort order
     *
     * @return {@link com.jivesoftware.api.core.v3.entities.content.TaskEntity}[] listing the personal tasks
     *
     * @exception OK Request was successful
     * @exception BadRequestException An input field is malformed
     * @since 3.1
     */
    @GET
    @Path("/{personID}/tasks")
    @RequiresAuthentication
    @Trace
    public Entities<ContentEntity> getTasks(@PathParam("personID") String personID,
                                            @QueryParam("sort") @DefaultValue("dateCreatedDesc") String sort,
                                            @QueryParam("startIndex") @DefaultValue("0") int startIndex,
                                            @QueryParam("count") @DefaultValue("25") int count,
                                            @QueryParam("fields") @DefaultValue("@all") String fields)
            throws BadRequestException
    {
        List<String> filters = new ArrayList<String>();
        filters.add("type(task)");
        String personURI = servicePathProvider.servicePath(this.getClass(), "getPerson", personID).toString();
        filters.add("author(" + personURI + ")");

        List<ContentEntity> content = commonContentProvider.getContent(filters, sort, startIndex, count, fields);
        Paginator paginator = paginationHelper.getPaginator(startIndex, count, null);
        ImmutableMultimap.Builder<String, String> parameterBuilder = ImmutableMultimap.builder();
        addQueryParam("sort", sort, parameterBuilder);
        addQueryParam("fields", fields, parameterBuilder);
        return attachPagination(paginator, content, parameterBuilder.build());
    }

    /**
     * <p>Return a {@link PersonEntity} describing the manager of the specified person.</p>
     *
     * @param personID ID of the specified Jive user
     * @param fields Fields to be returned (or <code>null</code> for all fields)
     *
     * @retrieves {@link PersonEntity} describing the manager of the specified user
     * @exception OK Request was successful
     * @exception BadRequestException The request criteria are malformed
     * @exception ForbiddenException The requesting user is not authorize to retrieve this user information
     * @exception GoneException Organization Chart relationships are not supported by this Jive instance
     * @exception NotFoundException The specified user cannot be found
     */
    @GET
    @Path("/{personID}/@manager")
    @Trace
    public PersonEntity getManager(@PathParam("personID") String personID,
                                   @QueryParam("fields") @DefaultValue(PersonEntity.ALL_FIELDS) String fields)
            throws BadRequestException, ForbiddenException, GoneException, NotFoundException
    {
        PersonEntity entity = personProvider.getManager(personID, fields);
        return entity;
    }

    /**
     * <p>Return a paginated list of {@link PersonEntity}s describing the direct reports
     * of the specified person.</p>
     *
     * @param personID ID of the specified Jive user
     * @param startIndex Zero-relative index of the first instance to be returned
     * @param count Maximum number of instances to be returned (i.e. the page size)
     * @param fields Fields to be returned (or <code>null</code> for summary fields)
     *
     * @retrieves {@link PersonEntity}[] listing the direct reports of the specified person
     * @exception OK Request was successful
     * @exception BadRequestException The request criteria are malformed
     * @exception ForbiddenException The requesting user is not authorize to retrieve this user information
     * @exception GoneException Organization Chart relationships are not supported by this Jive instance
     * @exception NotFoundException The specified user cannot be found
     */
    @GET
    @Path("/{personID}/@reports")
    @Trace
    public Entities<PersonEntity> getReports(@PathParam("personID") String personID,
                                             @QueryParam("startIndex") @DefaultValue("0") int startIndex,
                                             @QueryParam("count") @DefaultValue("25") int count,
                                             @QueryParam("fields") @DefaultValue(PersonEntity.SUMMARY_FIELDS) String fields)
            throws BadRequestException, ForbiddenException, GoneException, NotFoundException
    {
        List<PersonEntity> entities = personProvider.getReports(personID, startIndex, count, fields);
        Paginator paginator = paginationHelper.getPaginator(startIndex, count, null);
        ImmutableMultimap.Builder<String, String> parameterBuilder = ImmutableMultimap.builder();
        addQueryParam("fields", fields, parameterBuilder);
        return attachPagination(paginator, entities, parameterBuilder.build());
    }

    /**
     * <p>Delete (i.e. retire) an existing manager-report relationship between the specified manager user and the
     * specified report user.</p>
     *
     * @param personID ID of the user which is the manager in the existing relationship
     * @param reportPersonID ID of the user which is the direct report in the existing relationship
     *
     * @exception NoContent Request was successful
     * @exception ConflictException if a manager-report relationship does not currently exist between these two users
     * @exception ForbiddenException if the requesting user is not allowed to delete this relationship
     * @exception GoneException if Organization Chart relationships are not supported by this Jive instance
     * @exception NotFoundException if one or both of the specified users cannot be found
     */
    @DELETE
    @Path("/{personID}/@reports/{reportPersonID}")
    @Trace
    public void deleteReport(@PathParam("personID") String personID,
                             @PathParam("reportPersonID") String reportPersonID)
            throws ConflictException, ForbiddenException, GoneException, NotFoundException
    {
        personProvider.deleteReport(personID, reportPersonID);
    }

    /**
     * <p>Return a {@link PersonEntity} describing the specified direct report of the specified person,
     * if such a relationship exists.</p>
     *
     * @param personID ID of the specified (manager) Jive user
     * @apram reportPersonID ID of the report for which information should be returned
     * @param fields Fields to be returned (or <code>null</code> for summary fields)
     *
     * @retrieves {@link PersonEntity} describing the direct report
     * @exception OK Request was successful
     * @exception BadRequestException No manager-report relationship exists between these people
     * @exception ForbiddenException The requesting user is not authorized to retrieve this user information
     * @exception GoneException Organization Chart relationships are not supported by this Jive instance
     * @exception NotFoundException The specified user cannot be found
     */
    @GET
    @Path("/{personID}/@reports/{reportPersonID}")
    @Trace
    public PersonEntity getReport(@PathParam("personID") String personID,
                                  @PathParam("reportPersonID") String reportPersonID,
                                  @QueryParam("fields") String fields)
            throws BadRequestException, ForbiddenException, GoneException, NotFoundException
    {
        PersonEntity entity = personProvider.getReport(personID, reportPersonID, fields);
        return entity;
    }

    /**
     * <p>Create a manager-report relationship between the specified user and the specified report user.</p>
     *
     * @param personID ID of the user which will be the manager in the new relationship
     * @param reportPersonID ID of the user which will be the direct report in the new relationship
     *
     * @exception NoContent Request was successful
     * @exception ConflictException A manager-report relationship already exists between these two users
     * @exception ForbiddenException The requesting user is not allowed to create this relationship
     * @exception GoneException Organization Chart relationships are not supported by this Jive instance
     * @exception NotFoundException One or both of the specified users cannot be found
     */
    @PUT
    @Path("/{personID}/@reports/{reportPersonID}")
    @Trace
    public void createReport(@PathParam("personID") String personID,
                             @PathParam("reportPersonID") String reportPersonID)
            throws ConflictException, ForbiddenException, GoneException, NotFoundException
    {
        personProvider.createReport(personID, reportPersonID);
    }

    /**
     * <p>Return the personal blog for the specified user.</p>
     *
     * @param personID ID of the user for which to return a personal blog
     * @param fields Fields to be returned (default is @all)
     *
     * @retrieves {@link com.jivesoftware.api.core.v3.entities.places.BlogEntity} containing the person's blog
     * @exception BadRequestException Any input field is malformed
     * @exception ForbiddenException You are not allowed to delete the blog for this user
     * @exception NotFoundException The specified user or blog does not exist
     */
    @GET
    @Path("/{personID}/blog")
    @Trace
    public BlogEntity getBlog(@PathParam("personID") String personID,
                              @QueryParam("fields") @DefaultValue("@all") String fields)
            throws BadRequestException, ForbiddenException, NotFoundException
    {
        BlogEntity entity = personProvider.getBlog(personID, fields);
        return entity;
    }

    /**
     * <p>Return a list of {@link com.jivesoftware.api.core.v3.entities.activity.StreamEntity}s in which the requesting user is following this person (if any).</p>
     *
     * @param personID ID of the user being followed
     * @param fields Fields to be returned on matching custom streams (default is @owned)
     *
     * @retrieves {@link com.jivesoftware.api.core.v3.entities.activity.StreamEntity}[]
     * @exception OK Request was successful
     * @exception NotFoundException The specified user cannot be found
     */
    @GET
    @Path("/{personID}/followingIn")
    @Trace
    public Entities<StreamEntity> getFollowingIn(@PathParam("personID") String personID,
                                                 @QueryParam("fields") @DefaultValue(StreamEntity.OWNED_FIELDS) String fields)
            throws NotFoundException
    {
        List<StreamEntity> entities = streamProvider.getFollowingIn(personID, fields);
        Entities<StreamEntity> results = new Entities<StreamEntity>(entities);
        return results;
    }

    /**
     * <p>Return a list of {@link com.jivesoftware.api.core.v3.entities.activity.StreamEntity}s in which the requesting user is following this person (if any).</p>
     *
     * @param personID ID of the user being followed
     * @param fields Fields to be returned on matching custom streams (default is @owned)
     *
     * @retrieves {@link com.jivesoftware.api.core.v3.entities.activity.StreamEntity}[]
     * @exception OK Request was successful
     * @exception NotFoundException The specified user cannot be found
     */
    @POST
    @Path("/{personID}/followingIn")
    @Trace
    public Entities<StreamEntity> createFollowingIn(@PathParam("personID") String personID,
                                                 @QueryParam("fields") @DefaultValue(StreamEntity.OWNED_FIELDS) String fields)
            throws NotFoundException
    {
        List<StreamEntity> entities = streamProvider.getFollowingIn(personID, fields);
        Entities<StreamEntity> results = new Entities<StreamEntity>(entities);
        return results;
    }

    /**
     * <p>Return a list of {@link com.jivesoftware.api.core.v3.entities.content.ProfileImageEntity}s for the profile images of the specified person.</p>
     *
     * @param personID ID of the specified person
     * @param fields Fields to be returned on the profile images
     *
     * @retrieves {@link com.jivesoftware.api.core.v3.entities.content.ProfileImageEntity}[]
     * @exception OK Request was successful
     */
    @GET
    @Path("/{personID}/images")
    @Trace
    public Entities<ProfileImageEntity> getProfileImages(@PathParam("personID") String personID,
                                                         @QueryParam("fields") String fields)
    {
        List<ProfileImageEntity> entities = profileImageProvider.getProfileImages(personID, fields, true);
        Entities<ProfileImageEntity> results = new Entities<ProfileImageEntity>(entities);
        return results;
    }

    /**
     * <p>Delete the specified profile image for the specified user.</p>
     *
     * @param personID ID of the specified user
     * @param index 1-relative index of the specified profile image
     *
     * @exception NoContent Request was successful
     * @exception BadRequestException if the specified index is out of range
     * @exception GoneException if profile images are not enabled in this Jive instance
     * @exception NotFoundException if the specified user or profile image cannot be found
     */
    @DELETE
    @Path("/{personID}/images/{index}")
    @RequiresAuthentication
    @Trace
    public void deleteProfileImage(@PathParam("personID") String personID,
                                   @PathParam("index") int index)
            throws BadRequestException, GoneException, NotFoundException
    {
        profileImageProvider.deleteProfileImage(personID, index);
    }

    /**
     * <p>Return a {@link ProfileImageEntity} describing the specified profile image information
     * for the specified user.</p>
     *
     * @param personID ID of the specified user
     * @param index 1-relative index of the specified profile image
     * @fields Fields to be returned on the profile image
     *
     * @retrieves {@link ProfileImageEntity}
     * @exception OK Request was successful
     * @exception BadRequestException if the specified index is out of range
     * @exception GoneException if profile images are not enabled in this Jive instance
     * @exception NotFoundException if the specified user or profile image cannot be found
     */
    @GET
    @Path("/{personID}/images/{index}")
    @Trace
    public ProfileImageEntity getProfileImage(@PathParam("personID") String personID,
                                              @PathParam("index") int index,
                                              @QueryParam("fields") String fields)
            throws BadRequestException, GoneException, NotFoundException
    {
        ProfileImageEntity entity = profileImageProvider.getProfileImage(personID, index, fields);
        return entity;
    }

    /**
     * <p>Create the specified profile image for the specified user at the next available index.  Return a 201 (Created)
     * status with a <code>Location</code> header containing the URI of the new profile image.</p>
     *
     * @param personID ID of the specified user
     * @param imageURI URI for the temporary profile image that was previously uploaded
     * @param fields Fields to be returned in the new profile image
     *
     * @retrieves {@link ProfileImageEntity}
     * @exception Created Request was successful
     * @exception BadRequestException if a request parameter is malformed or index is out of bounds
     * @exception GoneException if profile images are not enabled in this Jive instance
     * @exception NotFoundException if the specified user cannot be found
     */
    @POST
    @Path("/{personID}/images")
    @RequiresAuthentication
    @Trace
    public Response setProfileImage(@PathParam("personID") String personID,
                                    @FormParam("imageURI") String imageURI,
                                    @QueryParam("fields") String fields)
            throws BadRequestException, GoneException, NotFoundException
    {
        Response response = profileImageProvider.setProfileImage(personID, imageURI, fields);
        return response;
    }

    /**
     * <p>Create or replace the specified profile image for the specified user.  Return a 201 (Created)
     * status with a <code>Location</code> header containing the URI of the new profile image.</p>
     *
     * @param personID ID of the specified user
     * @param index 1-relative index of the specified profile image
     * @param imageURI URI for the temporary profile image that was previously uploaded
     * @param fields Fields to be returned in the new profile image
     *
     * @retrieves {@link ProfileImageEntity}
     * @exception Created Request was successful
     * @exception BadRequestException if a request parameter is malformed or index is out of bounds
     * @exception GoneException if profile images are not enabled in this Jive instance
     * @exception NotFoundException if the specified user cannot be found
     */
    @POST
    @Path("/{personID}/images/{index}")
    @RequiresAuthentication
    @Trace
    public Response setProfileImage(@PathParam("personID") String personID,
                                    @PathParam("index") int index,
                                    @FormParam("imageURI") String imageURI,
                                    @QueryParam("fields") String fields)
            throws BadRequestException, GoneException, NotFoundException
    {
        Response response = profileImageProvider.setProfileImage(personID, index, imageURI, fields);
        return response;
    }

    /**
     * <p>Return the binary profile image data for the specified profile image for the specified user.</p>
     *
     * @param personID ID of the specified user
     * @param index 1-relative index of the specified profile image
     * @param size Size (in pixels) of the requested profile image, or 0 for the default
     *
     * @retrieves Binary content of the specified image
     * @exception OK Request was successful
     * @exception BadRequestException The specified index is out of range, or the size is invalid
     * @exception GoneException Profile images are not enabled in this Jive instance
     * @exception NotFoundException The specified user or profile image cannot be found
     */
    @GET
    @Path("/{personID}/images/{index}/data")
    @Trace
    public Response getProfileImageData(@PathParam("personID") String personID,
                                        @PathParam("index") int index,
                                        @QueryParam("size") @DefaultValue("0") int size)
            throws BadRequestException, GoneException, NotFoundException
    {
        InputStream stream = profileImageProvider.getProfileImageData(personID, index, size);
        Response response = Response.ok(stream)
                .type("image/png")
                .build();
        return response;
    }

    /**
     * <p>Return a list of {@link StreamEntity}s for the specified user.  Because the number of streams
     * will generally be very small, pagination is not supported.</p>
     *
     * @param personID ID of the user for whom to return custom streams
     * @param fields Fields to be returned (default value is "@owned")
     *
     * @retrieves {@link StreamEntity}[]
     * @exception OK Request was successful
     * @exception ForbiddenException The requester is not allowed to view custom streams for the owning user
     * @exception NotFoundException The specified user cannot be found
     */
    @GET
    @Path("/{personID}/streams")
    @RequiresAuthentication
    @Trace
    public Entities<StreamEntity> getStreams(@PathParam("personID") String personID,
                                             @QueryParam("fields") @DefaultValue("@owned") String fields)
            throws ForbiddenException, NotFoundException {
        List<StreamEntity> entities = streamProvider.getStreams(personID, fields);
        Paginator paginator = paginationHelper.getPaginator(0, 10, null);
        ImmutableMultimap.Builder<String, String> parameterBuilder = ImmutableMultimap.builder();
        addQueryParam("fields", fields, parameterBuilder);
        return attachPagination(paginator, entities, parameterBuilder.build());
    }

    /**
     * <p>Create a new custom stream for the specified user, based on the information in the specified
     * {@link StreamEntity}.  Then, return a 201 with a {@link StreamEntity} reflecting the new stream
     * configuration.</p>
     *
     * <p>The following fields are processed from the incoming stream entity:</p>
     * <ul>
     *     <li><strong>name</strong> - the name of the new stream (must be unique per user)</li>
     *     <li><strong>receiveEmails</strong> - flag indicating whether the user wants to receive email
     *         from this stream</li>
     * </ul>
     *
     * @param personID ID of the user for whom to create a new stream, or <code>null</code> for the calling user
     * @param entity Configuration information to construct the new stream
     * @param fields Fields to be returned on the newly created entity (defaults to @all)
     *
     * @retrieves {@link StreamEntity} describing the newly created stream
     * @exception Created Request was successful
     * @exception BadRequestException One or more input values is malformed
     * @exception ConflictException Requesting to create a custom stream with a name that already exists; or max number of streams has been reached
     * @exception ForbiddenException Requester is not allowed to manage custom streams for the specified user
     *  (i.e. not the specified user or a Jive admin)
     * @exception NotFoundException Specified user cannot be found
     */
    @POST
    @Path("/{personID}/streams")
    @Consumes("application/json")
    @RequiresAuthentication
    @Trace
    public Response createStream(@PathParam("personID") String personID,
                                 @QueryParam("fields") String fields,
                                 StreamEntity entity)
            throws BadRequestException, ConflictException, ForbiddenException, NotFoundException
    {
        entity = streamProvider.createStream(personID, entity, fields);
        URI uri = entity.getResources().get("self").getRef();
        return Response.created(uri).entity(entity).build();
    }

    /**
     * <p>Return a list of notifications for the current user</p>
     * @return
     */
    @GET
    @Path("/notifications")
    @RequiresAuthentication
    @Trace
    public Response getNotifications(){
        if (getUser().getID() == AnonymousUser.ANONYMOUS_ID) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        ActivityStreamService activityStreamServiceIimpl =  (ActivityStreamService)JiveApplication.getContext().getSpringBean("");

        long since = 0L;

        long now = System.currentTimeMillis();
        since = Math.max(now - 1800000L, since); // restrict to the last 30m
        BrowserEventBundle bundle = new BrowserEventBundle();
        Set<String> providerNames = getProviderNames("activityStream.poll");
        bundle.setEvents(browserEventManager.getForUser(getUser(), since, providerNames));
        // wait less because this operation may take a few cycles, but at least 10s
        bundle.setNow(now);
        bundle.setWait(Math.max(1000L, getWait()));

        return Response.ok(bundle).build();
    }

    private Set<String> getProviderNames(String providerNamesString) {
        return Sets.newHashSet(providerNamesString.split(","));
    }

    private long getWait() {
        return JiveGlobals.getJiveLongProperty(com.jivesoftware.community.event.browser.BrowserEventManager.BROWSER_EVENTS_POLLING_DELAY, 300000L);
    }

    //2. set StreamConfiguration for a stream

    public User getUser() {
        return authenticationProvider.getJiveUser();
    }

    public BrowserEventManager getBrowserEventManager() {
        return browserEventManager;
    }

    public void setBrowserEventManager(BrowserEventManager browserEventManager) {
        this.browserEventManager = browserEventManager;
    }

    @GET
    @Path("/social/login/{personID}")
    @RequiresAuthentication
    @Trace
    public Response socialLogin(@PathParam("personID") String personID)
            throws BadRequestException, GoneException, NotFoundException, GSKeyNotFoundException, UserNotFoundException
    {
        if(isValidatedUser(personID)){
            return Response.ok(
                    notifyLogin(
                            personID,
                            false,
                            null,
                            "mobile")
            ).build();
        }else{
            return Response.status(404).build();
        }
    }

    @GET
    @Path("/social/login/{personID}/new")
    @RequiresAuthentication
    @Trace
    public Response socialLoginNew(@PathParam("personID") String personID)
            throws BadRequestException, GoneException, NotFoundException, GSKeyNotFoundException, UserNotFoundException
    {
        if(isValidatedUser(personID)){
            User user = JiveApplication.getContext().getUserManager().getUser(Long.getLong(personID));
            return Response.ok(
                        notifyLogin(
                                personID,
                                true,
                                GigyaUtils.userInfoJsonString(user),
                                "mobile")
            ).build();
        }else{
            return Response.status(404).build();
        }
    }

    @GET
    @Path("/social/logout/{personID}")
    @RequiresAuthentication
    @Trace
    public Response socialLogout(@PathParam("personID") String personID)
            throws BadRequestException, GoneException, NotFoundException, GSKeyNotFoundException
    {
        if(isValidatedUser(personID))
            return Response.ok(notifyLogout(personID, "mobile").getResponseText()).build();
        else{
            return Response.status(404).build();
        }
    }

    /**
     * <p>Create a {@link PersonEntity} for a new user based on the contents of the specified
     * {@link PersonEntity}.  Only modifiable fields that actually provide a value in the incoming
     * entity are processed.
     * </p>
     *
     * <p>The JSON representation of the absolute minimum information that must be included to
     * create a new person looks like this:</p>
     * <pre>
     *     {
     *         "emails" : [ {
     *             "value" : "{emailAddress}",
     *             "type" : "work",
     *             "primary" : true,
     *             "jive_label" : "Email"
     *         } ],
     *         "jive" : {
     *             "password" : "{password}",
     *             "username" : "{username}"
     *         },
     *         "name" : {
     *             "familyName" : "{lastName}",
     *             "givenName" : "{firstName}"
     *         }
     *     }                                               `
     * </pre>
     *
     * @param personEntity {@link PersonEntity} containing information describing the new user
     * @param fields The fields to include in the returned entity
     *
     * @exception com.jivesoftware.api.core.v3.exceptions.Created Request was successful
     * @exception BadRequestException Any of the input fields are malformed
     * @exception com.jivesoftware.api.core.v3.exceptions.ConflictException The requested change would cause business rules to be violated
     *  (such as more than one user with the same email address)
     * @exception ForbiddenException The requesting user is not authorized to make changes to the specified user
     * @exception com.jivesoftware.api.core.v3.exceptions.NotFoundException The specified user does not exist
     * @exception com.jivesoftware.api.core.v3.exceptions.NotImplementedException User creation is not supported in this Jive instance
     */
    @POST
    @Path("/social/register")
    @Consumes("application/json")
    @StaticJavaScriptMethod(name = "osapi.jive.corev3.people.social.create")
    @RequiresAuthentication
    @Retrieves(PersonEntity.class)
    @Trace
    public Response socialCreatePerson(PersonEntity personEntity,
                                       @QueryParam("fields") @DefaultValue(PersonEntity.ALL_FIELDS) String fields)
            throws BadRequestException, ConflictException, ForbiddenException, NotFoundException, NotImplementedException,
                    GSKeyNotFoundException
    {
        // create a new user and call the notifyRegistration with this users details
        personEntity = personProvider.createPerson(personEntity, fields);
        Resource self = personEntity.getResources().get("self");

        // TODO: check that email address is included
        notifyRegistration(personEntity.getId(), "mobile");

        return Response.created(self.getRef())
                .entity(personEntity)
                .build();
    }

    /**
     * Checks if the authenticated user is a member of a given social group. Returns true if the user is a member
     * of the group otherwise it returns false.
     * @param groupID the ID of the group to test the current authenticated user against.
     * @return
     * 406 Not Acceptable if the groupID is invalid
     * 404 Not Found if it cannot find the group with the given groupID
     */
    @GET
    @Path("/groups/member/status/{groupID}")
    @Consumes("application/json")
    @RequiresAuthentication
    @Trace
    public Response isUserMemberOfGroup(@PathParam("groupID") @DefaultValue("0") long groupID) {
        if(groupID == 0)
            Response.status(Response.Status.NOT_ACCEPTABLE).build();

        User user = authenticationProvider.getJiveUser();
        SocialGroupManager socialGroupManager = JiveApplication.getContext().getSpringBean("socialGroupManager");
        SocialGroup group;

        try {
            group = socialGroupManager.getSocialGroup(groupID);
        } catch (com.jivesoftware.community.NotFoundException nfe) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        boolean isGroupMember = (socialGroupManager.isSocialGroupMember(group, user) || socialGroupManager.isSocialGroupOwner(group, user));

        return Response.ok(isGroupMember).build();
    }

    /**
     * Retrieve the list of groups for which a user is a member
     * @param sort
     * @param startIndex
     * @param count
     * @return
     */
    @GET
    @Path("/groups/member")
    @RequiresAuthentication
    @Trace
    public Response getUserGroups(@QueryParam("sort") @DefaultValue("dateCreatedDesc") String sort,
                                  @QueryParam("startIndex") @DefaultValue("0") int startIndex,
                                  @QueryParam("count") @DefaultValue("25") int count) {
        User user = authenticationProvider.getJiveUser();

        ArrayList<String> filteredList = new ArrayList<String>();
        filteredList.add("member");
        ItemsViewBean<PlaceItemBean> itemsViewBean = containerServiceImpl.getContainers(
                String.valueOf(user.getID()),
                0,		                            // type
                0,		                            // id
                "places",
                filteredList,
                null,	// query
                "member~recentActivityDateDesc", 	// sortkey
                0, 		                            // sortOrder
                startIndex, 	  	                // start index
                count,	  	                        // num of items
                -1,		                            // item view id
                -1,                                 // ?
                "thumb",
                0L,                                 // ?
                null,                               // ?
                null	                            // propNames
        );

        List<PlaceEntity> results = new ArrayList<PlaceEntity>(itemsViewBean.getItems().size());
        JiveContainer container;

        for(PlaceItemBean item : itemsViewBean.getItems()) {
            try {
                container = containerManager.getJiveContainer(JiveConstants.SOCIAL_GROUP, Integer.valueOf(item.getID()));
                results.add(
                        groupEntityConverter.convert(container, GroupEntity.ALL_FIELDS)
                );
            } catch (com.jivesoftware.community.NotFoundException nfe) {
                log.error(nfe.getMessage(), nfe);
            }
        }

        HashMap<String, List<PlaceEntity>> list = new HashMap<String, List<PlaceEntity>>();
        list.put("list", results);
        return Response.ok(list).build();
    }

    /**
     * Retrieve the list of space for a user is a following
     *
     * @param sort
     * @param startIndex
     * @param count
     * @return
     */
    @GET
    @Path("/spaces/following")
    @RequiresAuthentication
    @Trace
    public Response getUserSpaces(@QueryParam("sort") @DefaultValue("dateCreatedDesc") String sort,
                                  @QueryParam("startIndex") @DefaultValue("0") int startIndex,
                                  @QueryParam("count") @DefaultValue("25") int count) {
        User user = authenticationProvider.getJiveUser();

        ArrayList<String> filteredList = new ArrayList<String>();
        filteredList.add("following~objecttype~space");
        ItemsViewBean<PlaceItemBean> itemsViewBean = containerServiceImpl.getContainers(
                String.valueOf(user.getID()),
                0,                                    // type
                0,                                    // id
                "places",
                filteredList,
                null,                                // query
                "member~recentActivityDateDesc",    // sortkey
                0,                                    // sortOrder
                startIndex,                        // start index
                count,                                // num of items
                -1,                                    // item view id
                -1,                                 // ?
                "thumb",
                0L,                                 // ?
                null,                               // ?
                null                                // propNames
        );

        List<PlaceEntity> results = new ArrayList<PlaceEntity>(itemsViewBean.getItems().size());
        JiveContainer container;


        for(PlaceItemBean item : itemsViewBean.getItems()) {
            try {
                container = containerManager.getJiveContainer(JiveConstants.COMMUNITY, Integer.valueOf(item.getID()));
                results.add(
                        placeEntityConverter.convert(container, PlaceEntity.ALL_FIELDS)
                );
            } catch (com.jivesoftware.community.NotFoundException nfe) {
                log.error(nfe.getMessage(), nfe);
            }
        }
        HashMap<String, List<PlaceEntity>> list = new HashMap<String, List<PlaceEntity>>();
        list.put("list", results);
        return Response.ok(list).build();
    }

    /**
     * A service to leave a group by simply providing it's groupID
     *
     * @param groupID
     * @return
     */
    @DELETE
    @Path("/group/{groupID}")
    @RequiresAuthentication
    @Trace
    public Response leaveGroup(@PathParam("groupID") Long groupID)
            throws BadRequestException, GoneException, NotFoundException, GSKeyNotFoundException
    {
        SocialGroupManager socialGroupManager = JiveApplication.getContext().getSpringBean("socialGroupManager");
        SocialGroup group = null;

        try {
            group  = socialGroupManager.getSocialGroup(groupID);
        } catch (com.jivesoftware.community.NotFoundException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            return Response.ok("Unable to find group with ID:" + groupID).build();
        }

        User user = authenticationProvider.getJiveUser();

        if(socialGroupManager.isSocialGroupMember(group, user)) {
            socialGroupManager.removeMember(group, user);
        } else {
            return Response.ok("This user is not a member of group " + groupID).status(Response.Status.NOT_MODIFIED).build();
        }


        return  Response.ok().build();
    }

    private String renderTermsBody(String body) {
        //TODO: We really need to make TermsAndConditions a JiveObject, so we can run it through the regular render pipeline and stop treating it like some weird one-off.
            if(body != null && !body.isEmpty()){
            String out = RenderUtils.renderToHtml(null, globalRenderManager, body);
            out = JAXPUtils.replaceBodyWithDiv(out);
            return out;
        }
        return "";
    }

    @GET
    @Path("/terms")
    @Trace
    public Response getTermsAndConditions() {
        String externalURL = registrationManager.getTermsURL();
        if(externalURL != null || !externalURL.equals("")) {
            return  Response.ok(externalURL).build();
        } else {
            return Response.ok(
                    renderTermsBody(
                            registrationManager.getCurrentTermsAndConditions().getBody()
                    )
            ).build();
        }
    }

    @POST
    @Path("/terms/accept")
    @RequiresAuthentication
    @Trace
    public Response acceptTermsAndConditions() {
        boolean termsEnabled = registrationManager.isTermsEnabled();

        if (!termsEnabled)
            return Response.notModified("Terms and Conditions is disabled on this system.").build();

        User user = authenticationProvider.getJiveUser();

        //check if the user has already accepted the terms and conditions
        if(user.getProperties().get(TermsAndConditionsHelper.USER_TERMS_AND_CONDITIONS_VERSION) != null)
            return Response.notModified("The current user has already accepted the current version of the terms and conditions.").build();

        user.getProperties().put(
                TermsAndConditionsHelper.USER_TERMS_AND_CONDITIONS_VERSION,
                String.valueOf(registrationManager.getCurrentTermsAndConditions().getVersion())
        );

        try {
            userManager.updateUser(user);
            return Response.ok().build();
        }
        catch (UserNotFoundException e) {
            log.error("User not found, id: " + user.getID(), e);
        }
        catch (UserAlreadyExistsException e) {
            log.error("User already exists, id: " + user.getID(), e);
        }
        return null;
    }

    protected ToDoActivityEntityConverter toDoActivityEntityConverter;


    public class CustomActivityEntity {
        public long targetId;
        public ActivityEntity entity;

        public CustomActivityEntity(){}
        public CustomActivityEntity(long targetId, ActivityEntity entity){
            this.targetId = targetId;
            this.entity = entity;
        }

        public long getTargetId() {
            return targetId;
        }

        public void setTargetId(long targetId) {
            this.targetId = targetId;
        }

        public ActivityEntity getEntity() {
            return entity;
        }

        public void setEntity(ActivityEntity entity) {
            this.entity = entity;
        }
    }


    public ActionProvider actionProvider;

    public ActionProvider getActionProvider() {
        return actionProvider;
    }

    public void setActionProvider(ActionProvider actionProvider) {
        this.actionProvider = actionProvider;
    }

    /**
     * Get list of friend requests
     */
    @GET
    @Path("/friend")
    @RequiresAuthentication
    @Trace
    public List<ActivityEntity> getFriendRequestList(@QueryParam("after") String after,
                                             @QueryParam("before") String before,
                                             @QueryParam("count") @DefaultValue("25") int count,
                                             @QueryParam("filter") List<String> filters,
                                             @QueryParam("fields") @DefaultValue(ToDoEntity.ALL_FIELDS) String fields) {

        List<InboxEntry.State> states = Lists.newArrayList(InboxEntry.State.awaiting_action);
        Paginator paginator = paginationHelper.getPaginator(count, after, before, "published", true);
        List<CustomActivityEntity> processed = new ArrayList<CustomActivityEntity>();

        List<ActivityEntity> list = actionProvider.getActions(
                paginator, filters, fields
        );

        /*
        for(ActivityEntity entity : list) {
             processed.add(new CustomActivityEntity(0L, entity)) ;
        }
        */

        return list;
    }



    /**
     * Adds given user id as a friend
     */
    @POST
    @Path("/friend/add/{userID}")
    @RequiresAuthentication
    @Trace
    public List<StreamAssociationManagementBean> addFriend(@PathParam("userID") Long userID) {
        StreamAssociationBean stream = new StreamAssociationBean(userID, 3);//object type 3
        List<StreamAssociationBean> list = new ArrayList<StreamAssociationBean>();
        list.add(stream);
        streamConfigurationService.manageUserAssociations(list);
        return streamConfigurationService.manageUserAssociations(list);
    }

    @POST
    @Path("/friend/remove/{userID}")
    @RequiresAuthentication
    @Trace
    public Response removeFriend(@PathParam("userID") long userID){
        User targetUser;
        try{
            targetUser = userManager.getUser(userID);
            User user = authenticationProvider.getJiveUser();

            if(user.isAnonymous())
                return Response.status(Response.Status.NOT_ACCEPTABLE).build();

            MeshUserRelationshipGraph friendsGraph = userRelationshipManager.getDefaultMeshRelationshipGraph();

            if(friendsGraph.isReflexive()){
                UserRelationship rel = userRelationshipManager.getFriendRelationship(user, targetUser, friendsGraph);
                try{
                    userRelationshipManager.retireRelationship(user, rel);
                }catch(NullPointerException e){
                    log.error(e.getMessage(), e);
                    return  Response.ok(
                            "Relationship already retired: User " + user.getName() + " has stopped following " + targetUser.getName() + " status: "+ rel.getRelationshipState().getState()).status(Response.Status.NOT_MODIFIED).build();
                }
                return Response.ok(
                        "Relationship Retired: User " + user.getName() + " has stopped following " + targetUser.getName() + " status: "+ rel.getRelationshipState().getState()).build();
            }
        }catch(UserNotFoundException e){
            log.error(e.getMessage(),e);
        }

        return Response.status(Response.Status.NOT_MODIFIED).build();
    }

    @POST
    @Path("/friend/approve/{userID}")
    @RequiresAuthentication
    @Trace
    public Response approveRequest(@PathParam("userID") long userID){
        User targetUser;
        try{
            targetUser = userManager.getUser(userID);
            User user = authenticationProvider.getJiveUser();

            if(user.isAnonymous()){
                return Response.status(Response.Status.NOT_ACCEPTABLE).build();
            }
            MeshUserRelationshipGraph  friendsGraph = userRelationshipManager.getDefaultMeshRelationshipGraph();
            if (friendsGraph.isReflexive()) {
                UserRelationship rel = userRelationshipManager.getRelationship(targetUser.getID(), user.getID(), friendsGraph);
                if (rel != null && rel.isPending()) {
                	userRelationshipManager.approveRelationship(rel, "Friend request approved.");
                	int code = UserRelationshipApprovalEntry.code;
            		UserRelationshipApprovalEntry inboxEntry
                            = (UserRelationshipApprovalEntry) inboxManager.get(
                                code,
                                user.getID(),
                                rel.getObjectType(),
                                rel.getID(),
                                com.jivesoftware.community.inbox.InboxEntry.State.awaiting_action);
            		if (inboxEntry != null) {
            			inboxManager.remove(inboxEntry.getID());
            		}
                    return Response.ok("Friend request approved.").build();
                }
            }
        }
        catch (UserNotFoundException e){
        	log.error(e.getMessage(),e);
            throw coreErrorBuilder.badRequestException(e).build();
        }
        return Response.status(Response.Status.NOT_MODIFIED).build();
    }

    /**
     *
     * Process given emails and return a result showing
         1. Those who are available on Yookos - return the PersonEntity
         2. Those available on Yookos but not your friends. - return the PersonEntity
         3. Those not on Yookos at all - a flag showing their status
     * @param emails     ["test@test.com", "test2@test.com"]
     * @return
     */
    @POST
    @Path("/contacts/check")
    @RequiresAuthentication
    @Trace
    public Response processFriends(List<String> emails){
        int MAX_EMAILS_TO_PROCESS = 200;
        UserTemplate friendTemplate = null;
        User friend = null;
        Boolean isFriend = false;
        MeshUserRelationshipGraph  friendsGraph = userRelationshipManager.getDefaultMeshRelationshipGraph();
        List<ProcessedEmail> result = new ArrayList<ProcessedEmail>(emails.size());

        //check size
        if(emails == null || emails.size() < 0)
            return Response.ok("No emails to process").status(Response.Status.BAD_REQUEST).build();

        if(emails != null && emails.size() > MAX_EMAILS_TO_PROCESS)
            return Response.ok("Batch sent is too large. Max allowable size is " + MAX_EMAILS_TO_PROCESS).build();

        for(String email : emails) {
            result.add(processEmail(friendsGraph, email, null));
        }

        return Response.ok(
                new ProcessedEmails(result)
        ).build();

    }

    private ProcessedEmail processEmail(MeshUserRelationshipGraph friendsGraph, String email, User user) {
        UserTemplate friendTemplate = null;
        User friend = null;
        Boolean isFriend = false;

        if(email != null && !email.equals("") && user == null)  {
            friendTemplate = new UserTemplate();
            friendTemplate.setEmail(email);
            friend = userManager.getUser(friendTemplate);
        } else {
            friend = user;
        }

        if (friend == null) {
            // add the check to the user object to see if email is stored already.
            ProcessedEmail processed;
            if (isInvitedByEmail(email))
                processed = new ProcessedEmail(email, Status.INVITED);
            else
                processed = new ProcessedEmail(email, Status.NONE);

           return processed;
        }

        isFriend = userRelationshipManager.isFriend(getUser(), friend, friendsGraph);

        //check if 'friend' is actually a friend
        if (isFriend) {
            ProcessedEmail processed = new ProcessedEmail(friend.getID(), email, friend.getName(), Status.FRIEND, friend.getUsername());

            return processed;
        }

        UserRelationship rel = userRelationshipManager.getRelationship(getUser().getID(), friend.getID(), friendsGraph);

        //check if pending approval
        if (rel != null && rel.isPending()) {
            ProcessedEmail processed = new ProcessedEmail(friend.getID(), email, friend.getName(), Status.PENDING, friend.getUsername());
            return processed;
        }

        // check if friend is at least on Yookos
        if (friend != null) {
            ProcessedEmail processed = new ProcessedEmail(friend.getID(), email, friend.getName(), Status.ONYOOKOS, friend.getUsername());
            return processed;
        }

        return null;
    }

    @GET
    @RequiresAuthentication
    @Trace
    @Path("/contacts/check/{token}")
    public Response checkRelationship(@PathParam("token") String token, @QueryParam("type") String type) {
        if(null == token || token.equals(""))
            return Response.ok().status(Response.Status.BAD_REQUEST).build();

        MeshUserRelationshipGraph friendsGraph = userRelationshipManager.getDefaultMeshRelationshipGraph();

        //is Email
        if(isValidEmail(token)){
            return Response.ok(processEmail(friendsGraph, token, null)).build();
        }

        //is userID
        if(StringUtils.isNumeric(token)){
            try {
                Long userID = Long.parseLong(token);
                User user = userManager.getUser(userID);
                return Response.ok(processEmail(friendsGraph, null, user)).build();

            } catch (com.jivesoftware.community.NotFoundException nfe){
                return Response.ok("User not found").status(Response.Status.NOT_FOUND).build();
            }
        }

        throw coreErrorBuilder.badRequestException("Invalid token  '" + token +"' - it could not be used to identify a user").build();
    }

    public boolean isValidEmail(String email) {
        if (email == null) {
            return false;
        }

        if(EmailValidator.getInstance().isValid(email))
            return true;

        return false;
    }

    /**
     * For each invitation, if a user is on Yookos then send them a friend request, otherwise send a Yookos invite
     * @param invitees an object storing the list of users to invite and any special message
     *
     *
     *  Request Payload
     *  {
            "message" : "Hi, Would you like to join Yookos? It's awesome guy!",
            "emails" : [ "emile.senga@gmail.com", "emile@senga.cd" ]
        }
     * @return
     */
    @POST
    @Path("/contacts/invite")
    @RequiresAuthentication
    @Trace
    public Response processInvites(Invitees invitees){
        if(null == invitees.getEmails())
            return Response.ok("No emails provided with the request").status(Response.Status.BAD_REQUEST).build();

        int MAX_EMAILS_TO_PROCESS = 50;
        UserTemplate friendTemplate = null;
        User friend = null;
        List<ProcessedEmail> result = new ArrayList<ProcessedEmail>(invitees.getEmails().size());
        List<String> emailsToInvite = new ArrayList<String>();

        //check size
        if(invitees.getEmails() == null || invitees.getEmails().size() < 1)
            return Response.ok("No emails to process").status(Response.Status.BAD_REQUEST).build();

        if(invitees.getEmails() != null && invitees.getEmails().size() > 50)
            return Response.ok("Batch sent is too large. Max size is " + MAX_EMAILS_TO_PROCESS).build();

        for(String email : invitees.getEmails()) {
            friendTemplate = new UserTemplate();
            friendTemplate.setEmail(email);
            friend = userManager.getUser(friendTemplate);

            if(friend == null)  {
                emailsToInvite.add(email);
                continue;
            } else {
                Boolean isSent = sendFriendRequest(friend);
                if(isSent) {
                    ProcessedEmail processed = new ProcessedEmail(friend.getID(), email, friend.getName(), Status.PENDING, friend.getUsername());
                    result.add(processed);
                }
                continue;
            }
        }

        inviteToYookos(emailsToInvite, invitees.getMessage());

        //object must return processed emails and invited emails separately
        return Response.ok(
                new InviteResults(emailsToInvite, result)
        ).build();
    }

    /**
     * Send a friend request to the specified user
     * @param user
     */
    private Boolean sendFriendRequest(User user){
        List<StreamAssociationManagementBean> streams = addFriend(user.getID());
        if(null == streams)
            return false;

        return true;
    }

    /**
     * send a Yookos invite to the specified email
     * @param emails
     */
    private void inviteToYookos(List<String> emails, String message){
        if(emails == null)
            return;

        String body = "";

        if(StringUtils.isNotBlank(message) && StringUtils.isNotEmpty(message))
            body = message;
        else
            body  = "Hi, I'd like to invite you to join me in a new community called Yookos. We're using it as a place to collaborate, share ideas, and keep each other updated. We can also share documents, create discussions and form groups. " + getUser().getName();

        String entity = "{" +
                        "   \"body\":\"" + body + "\",\n" +
                        "   \"invitees\": [" +
                            formatEmails(emails) +
                        "   ]" +
                        "}";

        //inviteService.createInvites("1", entity, Entity.ALL_FIELDS);

        try {
            /*
            JiveContainer place = JiveApplication.getContext().getJiveContainerManager().getJiveContainer(
                14, //type
                1L  //ID
            );
            */

            JiveContainer place = JiveApplication.getContext().getCommunityManager().getRootCommunity();

            JSONObject object = new JSONObject(entity);

            Response response = inviteProvider.createInvite(place, object, Entity.ALL_FIELDS);

            //all is well so store the invited individuals to the user property
            User user = getUser();

            if(200 == response.getStatus() || 201 == response.getStatus())  {
                user.getProperties().put("invitedEmails", convertListToString(emails));
                userManager.updateUser(user);
            }

            //return response;
        } catch (com.jivesoftware.community.NotFoundException nfe) {
            log.error("could not update users invited emails.", nfe);
            throw coreErrorBuilder.badRequestException(nfe).build();
        } catch (JSONException e) {
            log.error("could not update users invited emails.", e);
            throw coreErrorBuilder.badRequestException(e).build();
        } catch (UserAlreadyExistsException unfe) {
            log.error("could not update users invited emails.", unfe);
            throw coreErrorBuilder.badRequestException(unfe).build();
        }
    }

    /**
     * Checks if the current authenticated user has invited the person with the given email
     * @param email
     * @return
     */
    private Boolean isInvitedByEmail(String email) {
        User user = getUser();
        String  invitedEmails = user.getProperties().get("invitedEmails");
        if(null == invitedEmails || invitedEmails.equals(""))
            return false;

        if(invitedEmails.contains(email))
            return true;

        return false;
    }

    private String formatEmails(List<String> emails) {
        StringBuffer buffer = new StringBuffer("");
        for(String email : emails) {
            buffer.append("\"" +email + "\",");
        }
        return buffer.toString();
    }

    public void setNotificationSettingsManager(NotificationSettingsManager notificationSettingsManager) {
        this.notificationSettingsManager = notificationSettingsManager;
    }

    public void setStreamHelper(StreamHelper streamHelper) {
        this.streamHelper = streamHelper;
    }

    /**
     * Get the current users preferences
     * @return
     */
    @GET
    @RequiresAuthentication
    @Trace
    @Path("/preferences")
    public Response getUserPreferences() {
        Map<String, Object> data = Maps.newHashMap();
        User user = getUser();
        NotificationSettingsBean notificationSettings = notificationSettingsManager.getSettings(user);

        data.put("streams", streamHelper.getUserStreams(user, JiveApplication.getContext().getLocaleManager().getGlobaleLocale()));
        data.put("emailNotificationsEnabled", notificationSettingsManager.isNotificationsEnabled());

        data.put("notifyDirectActions", notificationSettings.isNotifyDirectActions());
        data.put("notifyActionQueue", notificationSettings.isNotifyActionQueue());
        data.put("notifyInboxNotifications", notificationSettings.isNotifyInboxNotifications());

        boolean mobileEnabled = Boolean.valueOf(user.getProperties().get(IS_MOBILE_NOTIFICAITON_ENABLED));
        data.put("enabledMobileNotification", mobileEnabled);

        return Response.ok(data).build();
    }

    /**
     * Get the current users mobile notifications status
     *
     * @return
     */
    @GET
    @RequiresAuthentication
    @Trace
    @Path("/preferences/mobile/notifications")
    public Response getMobileNotificationPreference(){
        boolean isMobileNotificationsEnabled = Boolean.valueOf(getUser().getProperties().get(IS_MOBILE_NOTIFICAITON_ENABLED));

        return Response.ok(
                new NotificationConfiguration(isMobileNotificationsEnabled, "mobile")
        ).build();
    }

    /**
     * Updates the users mobile notification settings (string must be true or false
     *
     * @param status
     * @return
     */
    @PUT
    @RequiresAuthentication
    @Trace
    @Path("/preferences/mobile/notifications/{status}")
    public Response setMobileNotificationPreference(@PathParam("status") String status) {
        if(status == null && (!status.equalsIgnoreCase("true") || !status.equalsIgnoreCase("false")))
            return Response.ok("Invalid mobile notification setting").status(Response.Status.NOT_ACCEPTABLE).build();

        getUser().getProperties().put(IS_MOBILE_NOTIFICAITON_ENABLED, String.valueOf(status));
        boolean isMobileNotificationsEnabled = Boolean.valueOf(getUser().getProperties().get(IS_MOBILE_NOTIFICAITON_ENABLED));

        return Response.ok(
                new NotificationConfiguration(isMobileNotificationsEnabled, "mobile")
        ).build();
    }

    /**
     * Get the current users email notifications status
     *
     * @return
     */
    @GET
    @RequiresAuthentication
    @Trace
    @Path("/preferences/email/notifications")
    public Response getEmailNotificationPreference() {
        User user = getUser();

        if(null == user || user.isAnonymous())
            return Response.ok("Invalid User").status(Response.Status.NOT_FOUND).build();

        boolean emailNotificationsEnabled  = notificationSettingsManager.getSettings(user).isReceiveEmails();
        return Response.ok(
                new NotificationConfiguration(emailNotificationsEnabled, "email")
        ).build();
    }

    /**
     * Enable or disable overall email notifications
     * @param status
     * @return
     */
    @PUT
    @RequiresAuthentication
    @Trace
    @Path("/preferences/email/notifications/{status}")
    public Response setEmailNotificationPreference(@PathParam("status") String status){
        if (status == null && (!status.equalsIgnoreCase("true") || !status.equalsIgnoreCase("false")))
            return Response.ok("Invalid email notification setting").status(Response.Status.NOT_ACCEPTABLE).build();

        User user = getUser();

        if (null == user || user.isAnonymous())
            return Response.ok("Invalid User").status(Response.Status.NOT_FOUND).build();

        NotificationSettingsBean  settings = notificationSettingsManager.getSettings(user.getID());
        settings.setReceiveEmails(Boolean.parseBoolean(status));
        notificationSettingsManager.saveSettings(user, settings);
        return Response.ok(
                new NotificationConfiguration(
                        notificationSettingsManager
                                .getSettings(user)
                                .isReceiveEmails()
                        , "email")
               ).build();
    }

    @GET
    @RequiresAuthentication
    @Trace
    @Path("/preferences/streams/{streamID}")
    public Response getEmailNotificationPreferenceForStream(@PathParam("streamID") String streamID) {
        return Response.ok(streamConfigurationService.viewStream(streamID)).build();
    }

    /**
     * A service to update the receiveEmail status of a stream
     * @param streamID the ID of the stream to update
     * @param streamConfigurationRequest - {"name":"Ma Famz","receiveEmails":true}
     * @return
     */
    @PUT
    @RequiresAuthentication
    @Trace
    @Path("/preferences/streams/{streamID}")
    public Response setEmailNotificationPreferenceForStream(@PathParam("streamID") long streamID, StreamConfigurationRequest streamConfigurationRequest) {
        return streamConfigurationService.modifyStream(streamID, streamConfigurationRequest);
    }

    //3. get streams and their configurations (/preferences)
    @GET
    @RequiresAuthentication
    @Trace
    @Path("/preferences/streams")
    public Response getEmailNotificationPreferenceForStreams(@PathParam("streamID") String streamID) {
        return Response.ok(streamConfigurationService.getUserActivityStreams()).build();
    }

    /**
     * End-point to deactivate the current authenticated users account
     *
     * @return Response object.
     */
    @POST
    @RequiresAuthentication
    @Trace
    @Path("/deactivate")
    public Response deactivateUserAccount(){
        User user = getUser();
        try {
            JiveApplication.getContext().getUserManager().disableUser(user);
        } catch (Exception e) {
            e.printStackTrace();
            return Response.ok().status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok().build();
    }


    private static final String BLOCKED_LIST = "user.blocked.list";

    //1. add user to the blocked list
    @POST
    @RequiresAuthentication
    @Trace
    @Path("/preferences/block/{id}")
    public Response blockUserFromNotifications(@PathParam("id") long id) throws UserNotFoundException, UserAlreadyExistsException {
        if(id < 0L)
            throw coreErrorBuilder.badRequestException("Invalid user ID to block given").build();

        User current = getUser();
        String blockedList = current.getProperties().get(BLOCKED_LIST);
        if(blockedList == null || blockedList.length() < 1)
            blockedList = String.valueOf(id);
        else {
            if(isDuplicate(String.valueOf(id), blockedList))
                return Response.notModified("User already blocked").build();
            else
                blockedList += "," + id;
        }

        current.getProperties().put(BLOCKED_LIST, blockedList);
        userManager.updateUser(current);

        return Response.ok(blockedList).build();
    }

    private boolean isDuplicate(String id, String blockedList){
        HashSet<String> hash = new HashSet<String>(Arrays.asList(blockedList.split(",")));
        if(hash.contains(id))
            return true;
        else
            return false;
    }

    //2. remove user from the blocked list
    @DELETE
    @RequiresAuthentication
    @Trace
    @Path("/preferences/block/{id}")
    public Response removeUserFromBlockedNotificationsList(@PathParam("id") long id) throws UserNotFoundException, UserAlreadyExistsException {
        if (id < 0L)
            throw coreErrorBuilder.badRequestException("Invalid user ID to block given").build();

        User current = getUser();
        String blockedList = current.getProperties().get(BLOCKED_LIST);
        if (blockedList == null || blockedList.length() < 1)
            return Response.notModified("Blocked list is empty.").build();
        else {
            List<String> elements = new LinkedList<String>(Arrays.asList(blockedList.split(",")));

            for(String cur : elements) {
                if(cur.equals(String.valueOf(id))){
                    elements.remove(cur);
                    break;
                }
            }

            blockedList = convertToString(elements);
        }

        current.getProperties().put(BLOCKED_LIST, blockedList);
        userManager.updateUser(current);

        return Response.ok(blockedList).build();
    }

    //3. clear the blocked list
    @DELETE
    @RequiresAuthentication
    @Trace
    @Path("/preferences/block/")
    public Response clearUserNotificationsBlockedList() throws UserNotFoundException, UserAlreadyExistsException {
        User current = getUser();
        current.getProperties().put(BLOCKED_LIST, null);
        userManager.updateUser(current);
        String blockedList = current.getProperties().get(BLOCKED_LIST);

        return Response.ok(blockedList).build();
    }

    //4. get the blocked list
    @GET
    @RequiresAuthentication
    @Trace
    @Path("/preferences/block/")
    public Response getUserNotificationsBlockedList() {
        User current = getUser();
        String blockedList = current.getProperties().get(BLOCKED_LIST);
        return Response.ok(blockedList).build();
    }

    private String convertToString(List<String> data) {
        StringBuilder result = new StringBuilder();
        for (String string : data) {
            result.append(string);
            result.append(",");
        }
        return result.length() > 0 ? result.substring(0, result.length() - 1) : "";
    }

    // --------------------------------------------------------------------------------------- Profile Privacy variables
    private Map<String, List<ProfileSecurityLevelView>> securityLevelOptions;
    private List<ProfileSecurityLevelView> previewLevels;
    private Iterator<SocialGroup> socialGroups;
    private Map<Long, EditProfileAction.EditProfileFieldValue> profile;
    protected Map<Long, ProfileField> fields;
    private String tags;

    private long nameSecurityLevelID;
    private long emailSecurityLevelID;
    private long imageSecurityLevelID;
    private long lastLoginSecurityLevelID;
    private long creationDateSecurityLevelID;
    private long presenceSecurityLevelID;

    // ----------------------------------------------------------------------------------------- Injectables for Privacy
    protected BrowseManager browseManager;
    private ProfileSecurityManager profileSecurityManager;
    protected ProfileFieldManager profileFieldManager;
    protected TagManager tagManager;
    private final transient JiveTextProvider textProvider = new JiveTextProvider(
            getClass(),
            new LocaleUtils.LocaleProviderWrapper(JiveGlobals.getLocale())
    );
    protected ProfileManager profileManager;

    // ---------------------------------------------------------------------------------- Supporting methods for Privacy
    public String getText(String key) {
        return textProvider.getText(key);
    }

    protected List<ProfileSecurityLevelView> createProfileSecurityLevelViews(List<ProfileSecurityLevel> presenceAvailableLevels) {
        List<ProfileSecurityLevelView> presenceViews = Lists.newArrayList();
        for (ProfileSecurityLevel level : presenceAvailableLevels) {
            if (level.isEnabled()) {
                presenceViews.add(new ProfileSecurityLevelView(level, getText(level.getNameKey())));
            }
        }
        return presenceViews;
    }

    private String getTextWithAlternate(String key, String alternateKey) {
        if (alternateKey != null) {
            String text = getText(alternateKey);
            if (text.equals(alternateKey)) {
                return getText(key);
            } else {
                return text;
            }
        } else {
            return getText(key);
        }
    }

    public void prepare() {
        fields = new HashMap<Long, ProfileField>();
        /**if (getUser() != null) {
            defaultUserValues(getUser());
        }
         **/
        for (ProfileField field : profileFieldManager.getProfileFields()) {
            fields.put(field.getID(), field);
        }
        if (profile == null) {
            profile = new HashMap<Long, EditProfileAction.EditProfileFieldValue>();
        }

        tags = tagManager.getTagsAsString(getUser());
    }

    // --------------------------------------------------------------------------------- Getters and Setters for Privacy


    public BrowseManager getBrowseManager() {
        return browseManager;
    }

    public void setBrowseManager(BrowseManager browseManager) {
        this.browseManager = browseManager;
    }

    public ProfileManager getProfileManager() {
        return profileManager;
    }

    public void setProfileManager(ProfileManager profileManager) {
        this.profileManager = profileManager;
    }

    public ProfileSecurityManager getProfileSecurityManager() {
        return profileSecurityManager;
    }

    public void setProfileSecurityManager(ProfileSecurityManager profileSecurityManager) {
        this.profileSecurityManager = profileSecurityManager;
    }

    public JiveTextProvider getTextProvider() {
        return textProvider;
    }

    public ProfileFieldManager getProfileFieldManager() {
        return profileFieldManager;
    }

    public void setProfileFieldManager(ProfileFieldManager profileFieldManager) {
        this.profileFieldManager = profileFieldManager;
    }

    public TagManager getTagManager() {
        return tagManager;
    }

    public void setTagManager(TagManager tagManager) {
        this.tagManager = tagManager;
    }

    public boolean isPresenceEnabled() {
        //return presenceEnabled;
        return false;
    }

    public boolean isProfileImageEnabled() {
        return profileManager.isProfileImageEnabled();
    }

    @GET
    @RequiresAuthentication
    @Trace
    @Path("/privacy/settings")
    public Response getPrivacySettings() {
        prepare();

        User targetUser = getUser();
        socialGroups = new CastingIterator<SocialGroup>(
                browseManager.getContainers(
                        ImmutableSet.<BrowseFilter>of(new MemberFilter().getBoundInstance(targetUser.getID())),
                        new ModificationDateSort(), 0, Integer.MAX_VALUE));

        securityLevelOptions = Maps.newHashMap();

        List<ProfileSecurityLevel> availableLevels = profileSecurityManager.getAvailableProfileSecurityLevels(targetUser);

        //levels for username
        ProfileSecurityLevel usernameLevel = availableLevels.get(0);
        securityLevelOptions.put("username", Lists.newArrayList(new ProfileSecurityLevelView(usernameLevel, getText(usernameLevel.getNameKey()))));

        //levels for name
        List<ProfileSecurityLevel> nameAvailableLevels = profileSecurityManager
                .getNonProfileFieldAvailableSecurityLevels(ProfileSecurityManager.NAME_PROFILE_SECURITY_LEVEL_OPTIONS,
                        targetUser);
        securityLevelOptions.put("name", createProfileSecurityLevelViews(nameAvailableLevels));

        //levels for email
        List<ProfileSecurityLevel> emailAvailableLevels = profileSecurityManager
                .getNonProfileFieldAvailableSecurityLevels(ProfileSecurityManager.EMAIL_PROFILE_SECURITY_LEVEL_OPTIONS,
                        targetUser);
        securityLevelOptions.put("email", createProfileSecurityLevelViews(emailAvailableLevels));

        //levels for image
        if (isProfileImageEnabled()) {
            List<ProfileSecurityLevel> imageAvailableLevels = profileSecurityManager
                    .getNonProfileFieldAvailableSecurityLevels(
                            ProfileSecurityManager.IMAGE_PROFILE_SECURITY_LEVEL_OPTIONS, targetUser);
            securityLevelOptions.put("image", createProfileSecurityLevelViews(imageAvailableLevels));
        }


        //levels for last login
        List<ProfileSecurityLevel> lastLoginAvailableLevels = profileSecurityManager
                .getNonProfileFieldAvailableSecurityLevels(ProfileSecurityManager.LAST_LOGIN_PROFILE_SECURITY_LEVEL_OPTIONS,
                        targetUser);
        securityLevelOptions.put("lastLogin", createProfileSecurityLevelViews(lastLoginAvailableLevels));

        //levels for creation date (member since)
        List<ProfileSecurityLevel> creationDateAvailableLevels = profileSecurityManager
                .getNonProfileFieldAvailableSecurityLevels(ProfileSecurityManager.CREATION_DATE_PROFILE_SECURITY_LEVEL_OPTIONS,
                        targetUser);
        securityLevelOptions.put("creationDate", createProfileSecurityLevelViews(creationDateAvailableLevels));

        //levels for presence
        if (isPresenceEnabled()) {
            List<ProfileSecurityLevel> presenceAvailableLevels = profileSecurityManager
                    .getNonProfileFieldAvailableSecurityLevels(
                            ProfileSecurityManager.PRESENCE_PROFILE_SECURITY_LEVEL_OPTIONS, targetUser);
            securityLevelOptions.put("presence", createProfileSecurityLevelViews(presenceAvailableLevels));
        }

        //profile fields
        for (ProfileField profileField : fields.values()) {
            List<ProfileSecurityLevelView> levelViews = Lists.newArrayList();
            List<Long> levelIDs = profileField.getAvailableSecurityLevelIDs();
            for (ProfileSecurityLevel psl : availableLevels) {
                if (levelIDs.contains(psl.getID())) {
                    levelViews.add(new ProfileSecurityLevelView(psl, getText(psl.getNameKey())));
                }
            }
            securityLevelOptions.put(String.valueOf(profileField.getID()), levelViews);
        }

        previewLevels = new ArrayList<ProfileSecurityLevelView>();
        for (ProfileSecurityLevel availableLevel : availableLevels) {
            if (availableLevel.isPreviewable()) {
                previewLevels.add(new ProfileSecurityLevelView(availableLevel, getTextWithAlternate(availableLevel.getNameKey(), availableLevel.getNameKey() + ".preview")));
            }
        }

        try {
            User u = userManager.getUser(targetUser.getID());    //get a fresh user copy so the props are up to date
            this.nameSecurityLevelID = profileSecurityManager
                    .getNonProfileFieldSecurityLevelID(User.NAME_PROFILE_SECURITY_LEVEL, u);
            this.emailSecurityLevelID = profileSecurityManager
                    .getNonProfileFieldSecurityLevelID(User.EMAIL_PROFILE_SECURITY_LEVEL, u);
            this.imageSecurityLevelID = profileSecurityManager
                    .getNonProfileFieldSecurityLevelID(User.IMAGE_PROFILE_SECURITY_LEVEL, u);
            this.lastLoginSecurityLevelID = profileSecurityManager
                    .getNonProfileFieldSecurityLevelID(User.LAST_LOGIN_PROFILE_SECURITY_LEVEL, u);
            this.creationDateSecurityLevelID = profileSecurityManager
                    .getNonProfileFieldSecurityLevelID(User.CREATION_DATE_PROFILE_SECURITY_LEVEL, u);
            this.presenceSecurityLevelID = profileSecurityManager
                    .getNonProfileFieldSecurityLevelID(User.PRESENCE_PROFILE_SECURITY_LEVEL, u);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }

        Map<Object, Object> result = Maps.newHashMap();
        Map<Long, ProfileFieldValue> latestProfile = new LinkedHashMap<Long, ProfileFieldValue>(profileManager.getProfile(targetUser));

        //if profile is empty, populate it and make sure profile fields are set to effective sec level IDs
        for (Long fieldID : fields.keySet()) {
            if (profile.get(fieldID) == null) {
                ProfileField field = fields.get(fieldID);
                ProfileFieldValue value = new ProfileFieldValue(field);
                //ensure any newly created fields is set to valid security level
                value.setEffectiveSecurityLevelID(profileSecurityManager.getEffectiveProfileSecurityLevelID(field, value, targetUser));
                profile.put(fieldID, new EditProfileAction.EditProfileFieldValue(value));
            }
        }

        result.put("profile", latestProfile);
        result.put("securityLevelOptions", securityLevelOptions);
        result.put("previewLevels", previewLevels);


        return Response.ok(result).build();
    }

    // ------------------------------   Start  MS-57   ------------------------------ //
    /**
     * MS-58: change avatar service -
     *
     -Pull all the avatar(s) of the user (there's a maximum of 5)
     -Functionality to add avatar(s) to the list (user can only have a maximum of 5)
     -Functionality to delete avatar(s) from the item list
     -Functionality to set an avatar from the item list

     * @param userID
     * @param index
     * @param body
     * @return
     * @throws IOException
     */
    @POST
    @RequiresAuthentication
    @Trace
    @Consumes("multipart/form-data")
    @Path("/{userID}/avatar/{index}/upload")
    public Response uploadUserAvatar(@PathParam("userID") long userID,
                                     @PathParam("index") int index,
                                     MultipartBody body) throws IOException {
        User user = getUser();
        if(user.isAnonymous())
            return Response.ok().status(Response.Status.UNAUTHORIZED).build();

        if(!isAuthorized(userID))
            return Response.ok().status(Response.Status.UNAUTHORIZED).build();

        if(hasExceededMaxAvatarUploads())
            return Response.ok().status(Response.Status.INTERNAL_SERVER_ERROR).build();


        org.apache.cxf.jaxrs.ext.multipart.Attachment attachment = attachmentHelper.findAttachmentWithFile(body);
        File image = writeToTempFile(attachment.getDataHandler().getInputStream(), getImageDir());
        String imageContentType = attachment.getContentType().toString();
        String filename = attachment.getContentDisposition().getParameters().get("filename");


        if(image == null)
            return Response.ok().status(Response.Status.BAD_REQUEST).build();

        if(!validateImageSize(image))
            return Response.ok(IMAGE_TOO_BIG_ERROR).status(Response.Status.BAD_REQUEST).build();

        if(!validateImage(image, imageContentType, filename))
            return Response.ok(IMAGE_TYPE_NOT_SUPPORTED).status(Response.Status.BAD_REQUEST).build();

        String tempImageName;
        InputStream in = null;

        try {
            TempImage tempImage = new TempImage(image);

            tempImage.adjustBackground();
            tempImage.resizeImage(MAX_CROP_WIDTH);
            tempImage.save();
            tempImageName = tempImage.getName();

            if(!isAllowedImageDimensions(tempImage))
                Response.ok("Image dimensions are wrong, ensure maxWidth of " +
                         maxAvatarWidth() + " and height of " +
                         maxAvatarHeight()).status(Response.Status.BAD_REQUEST).build();

            in = tempImage.getImageStream("png");

            Avatar avatar = avatarManager.createAvatar(getUser(), filename, imageContentType, in);

            if (!avatarManager.isModerateUserAvatars() || avatar.getModValue() > 0) {
                avatarManager.setActiveAvatar(getUser(), avatar);
            }
        } catch (IOException e) {
            log.error(String.format(IMAGE_READ_ERROR, image.getAbsoluteFile()), e);
            return Response.ok(IMAGE_READ_ERROR).status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch (java.lang.IllegalArgumentException iae) {
            log.error(String.format(IMAGE_READ_ERROR, image.getAbsoluteFile()), iae);
            return Response.ok(IMAGE_READ_ERROR).status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch(AvatarException ae){
            log.error(String.format(IMAGE_READ_ERROR, image.getAbsoluteFile()), ae);
            return Response.ok(IMAGE_READ_ERROR).status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } finally {
            closeStream(in);
        }

        return Response.ok("Remaining places " + getRemainingCount()).build();
    }


    /**
     * Get the list of user avatars
     * @return
     */
    @GET
    @RequiresAuthentication
    @Path("/avatars")
    public Response getUsersAvatars() {
        return Response.ok(getUserAvatars()).build();
    }

    @GET
    @Path("/avatars/{avatarID}")
    @Produces({"application/octet-stream", "application/json"})
    @Trace
    public Response getAvatarByID(@PathParam("avatarID") long  avatarID)
            throws BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException {
        try {
            Avatar avatar = avatarManager.getAvatar(avatarID);
            return response(avatar.getAttachment());
        } catch (AttachmentNotFoundException e) {
            throw coreErrorBuilder.notFoundException("Could not find the avatar with ID" + avatarID)
                    .build();
        } catch (IOException e) {
            throw coreErrorBuilder.internalServerErrorException("Could not find the avatar with ID" + avatarID)
                    .build();
        }
    }

    /**
     * @param avatarID
     * @return
     */
    @POST
    @RequiresAuthentication
    @Path("/avatars/{avatarID}")
    public Response setActiveAvatar(@PathParam("avatarID") long avatarID) {
        Avatar activeAvatar = null;
        if (avatarID > 0) {
            activeAvatar = avatarManager.getAvatar(avatarID);
        }

        avatarManager.setActiveAvatar(getUser(), activeAvatar);

        return Response.ok().build();
    }

    /**
     * Deletes the specified avatar and returns the avatarID of the newly set avatar for the current user
     * @return
     */
    @DELETE
    @RequiresAuthentication
    @Path("/avatars/{avatarID}")
    public Response deleteUserAvatar(@PathParam("avatarID") long avatarID) {
        User user = getUser();
        avatarManager.deleteAvatar(avatarManager.getAvatar(avatarID));
        return Response.ok().build();
    }

    /**
     * Gets teh number of remaining open slots for avatar uploads
     * @return
     */
    @GET
    @RequiresAuthentication
    @Path("/avatars/remaining")
    public Response getRemainingCount() {
        User user = getUser();
        return Response.ok(avatarManager.getMaxUserAvatars() - avatarManager.getAvatarCount(user)).build();
    }


    // ------------------------------   End MS-57   ------------------------------ //


    // ------------------------------   Sart MS-53   ------------------------------ //
    @POST
    @Path("/{userID}/status")
    public Response updateGivenUserStatus(@PathParam("userID") long userID, @QueryParam("key") String key, String message) throws UserNotFoundException {
        // 1. verify that current user is legit and has the authority to update users status
        // User actor = getUser();
        if (!canPostToStatus(key))
            throw coreErrorBuilder.forbiddenException("The current user does not have permission to update a user's status.").build();

        User recipient = null;
        try {
            recipient = userManager.getUser(userID);
        } catch (UserNotFoundException e) {
            log.error("Could not update the status of user with ID " + userID + ": User not found.", e);
            throw  coreErrorBuilder.notFoundException("Could not update the status of user with ID " + userID + " :User not found.").build();
        }

        // TODO
        // 2. verify that user has accepted to receive notifications from app games
        // 3. update the users status as themselves | runas, or see the emailing code to see how the system emulates a user.

        SudoExecutor<Void> userExecutor = new SudoExecutor<Void>(JiveApplication.getContext().getAuthenticationProvider(), new JiveUserAuthentication(recipient));
        try {
            userExecutor.executeCallable(
                    updateStatus(
                            recipient,  //the recipient
                            null ,      //TODO the actor - the app changing the status
                            message)    //the message of the status update
            );
        } catch (Exception e) {
            log.error(e.getMessage());
            e.printStackTrace();
            throw coreErrorBuilder.internalServerErrorException("Error occured while creating a status update on behalf of user " + recipient.getID()).build();
        }
        return Response.ok().build();
    }

    private boolean canPostToStatus(String key) {
        String keyString =  JiveGlobals.getJiveProperty("yookos.applications.allowed-to-post-to-users-wall");

        if(StringUtils.isBlank(keyString) || StringUtils.isEmpty(keyString))
            return false;

        String[] keys = keyString.split((","));

        for(int i = 0; i < keys.length; i++) {
            if(key.equalsIgnoreCase(keys[i]))
                return true;
        }
        return false; //change this to check that the user has the required permissions
    }

    protected Callable<Void> updateStatus(User recipient, User actor, String message) {
        return new UpdateUsersStatusCallable(recipient, actor, message);
    }

    public class UpdateUsersStatusCallable implements Callable<Void> {
        private User recipient;
        private User actor;
        private String message;

        public UpdateUsersStatusCallable(User recipient, User actor, String message) {
            this.recipient = recipient;
            this.actor = actor;
            this.message = message;
        }
        @Override
        public Void call() throws Exception {
            //update the recipients status with the message

            /*
            UserContainerManager userContainerManager = JiveApplication.getEffectiveContext().getUserContainerManager();
            UserContainer userContainer = userContainerManager.getUserContainer(recipient);

            WallEntryImpl entry = WallEntryImpl.createWallEntry(recipient, userContainer, message != null ? message: "");

            WallEntryManager wallEntryManager = JiveApplication.getEffectiveContext().getWallEntryManager();
            wallEntryManager.insert(entry);
            wallEntryManager.publish(entry);
            */

            /*
            WallEntryService wallEntryService = (WallEntryService) JiveApplication.getContext().getSpringBean("wallEntryServiceImpl");
            WallEntryBean bean = wallEntryService.getWallEntryBean(entry);

            wallEntryService.publishEntry(
                    14,
                    entry.getID(),
                    bean
            );
            */
            WallEntryManager wallEntryManager = JiveApplication.getEffectiveContext().getWallEntryManager();
            wallEntryManager.setCurrentStatus(recipient, message);

            return null;
        }
    }

    // ------------------------------   End  MS-53   ------------------------------ //

    public List<AvatarEntity> getUserAvatars() {
        return iteratorToCollection(avatarManager.getAvatars(getUser()).iterator());
    }

    private List<AvatarEntity> iteratorToCollection(Iterator<Avatar> iterator) {
        ArrayList<AvatarEntity> list = new ArrayList<AvatarEntity>();
        while (iterator.hasNext()) {
            Avatar next = iterator.next();
            list.add(new AvatarEntity(next));
        }
        return list;
    }

    /**
     * Closes the given stream
     *
     * @param out
     */
    protected void closeStream(Closeable out) {
        try {
            out.close();
        } catch (IOException e) {
            log.error(e);
        }
    }

    /**
     * checks that the given user **is** the current user and is authorized
     * @param userID
     * @return
     */
    protected boolean isAuthorized(long userID) {
        if (userID != getUser().getID()) {
            if (!UserPermHelper.isGlobalUserAdmin()) {
                return false;
            }
        }
        return true;
    }

    private boolean validateImageSize(File image) {
        return image.length() <= (imageManager.getMaxImageSize() * 1024);
    }

    protected boolean validateImage(File image, String imageContentType, String filename) {
        SupportedImageFileTypes types = new SupportedImageFileTypes();
        if (image == null || imageContentType == null) {
            return true;
        }

        Set<String> mimeTypes = types.getSupportedImageFileTypes();
        imageContentType = typeMap.getContentType(filename.toLowerCase());
        return mimeTypes.contains(imageContentType);
    }

    private boolean hasExceededMaxAvatarUploads() {
        int maxUserAvatars = avatarManager.getMaxUserAvatars();
        int userAvatarCount = avatarManager.getAvatarCount(getUser());

        // make sure the user hasn't already exceeded the maximum number of uploads
        if (maxUserAvatars != -1 && userAvatarCount + 1 > maxUserAvatars) {
            return true;
        }
        return false;
    }

    protected boolean isAllowedImageDimensions(TempImage tempImage) {
        if (doesImageExceedMaxDimensions(tempImage, maxAvatarWidth(), maxAvatarHeight()) && !allowResize()) {
            return false;
        }
        return true;
    }

    protected int maxAvatarWidth() {
        return avatarManager.getMaxAllowableWidth();
    }

    protected int maxAvatarHeight() {
        return avatarManager.getMaxAllowableHeight();
    }

    protected boolean allowResize() {
        return avatarManager.isAllowImageResize();
    }

    protected boolean doesImageExceedMaxDimensions(TempImage image, int maxAllowableWidth, int maxAllowableHeight) {
        return image.getWidth() > maxAllowableWidth || image.getHeight() > maxAllowableHeight;
    }

    public String[] getSupportedFileTypeNames() {
        SupportedImageFileTypes types = new SupportedImageFileTypes();
        supportedFileTypeNames = types.getSupportedImageNames().toArray(
                new String[types.getSupportedImageNames().size()]);
        return supportedFileTypeNames;
    }

    /**
     * Returns the directory that images are stored in.
     *
     * @return the directory that images are stored in.
     */
    public File getImageDir() {
        if (imageDir == null)
            init();
        return imageDir;
    }

    public void init() {
        // See if the directory is set as a property. If not, assume
        // images are stored in jiveHome/images
        String dir = JiveGlobals.getLocalProperty("images.directory");
        if (dir != null) {
            imageDir = new File(dir);
        } else {
            imageDir = JiveHome.getImages();
            if (!imageDir.exists()) {
                boolean result = imageDir.mkdir();
                if (!result) {
                    log.error("Unable to create image directory: '" + imageDir + "'");
                }
            }
        }
    }

    public UserRelationshipManager getUserRelationshipManager() {
        return userRelationshipManager;
    }

    public void setUserRelationshipManager(UserRelationshipManager userRelationshipManager) {
        this.userRelationshipManager = userRelationshipManager;
    }

    public ContainerService getContainerServiceImpl() {
        return containerServiceImpl;
    }

    public void setContainerServiceImpl(ContainerService containerService) {
        this.containerServiceImpl = containerService;
    }

    public PlaceEntityConverter<JiveContainer, PlaceEntity> getPlaceEntityConverter() {
        return placeEntityConverter;
    }

    public void setPlaceEntityConverter(PlaceEntityConverter<JiveContainer, PlaceEntity> placeEntityConverter) {
        this.placeEntityConverter = placeEntityConverter;
    }

    public PlaceEntityConverter<JiveContainer, GroupEntity> getGroupEntityConverter() {
        return groupEntityConverter;
    }

    // -------------------------------------------------------------------------------------------- Gigya Access Methods

    public void setGroupEntityConverter(PlaceEntityConverter<JiveContainer, GroupEntity> groupEntityConverter) {
        this.groupEntityConverter = groupEntityConverter;
    }

    public JiveContainerManagerImpl getContainerManager() {
        return containerManager;
    }

    public void setContainerManager(JiveContainerManagerImpl containerManager) {
        this.containerManager = containerManager;
    }


    // ------------------------------------------------------------------------------------------------- Support Methods

    public void setGlobalRenderManager(RenderManager globalRenderManager) {
        this.globalRenderManager = globalRenderManager;
    }

    public void setRegistrationManager(RegistrationManager registrationManager) {
        this.registrationManager = registrationManager;
    }

    public void setTermsAndConditionsHelper(TermsAndConditionsHelper termsAndConditionsHelper) {
        this.termsAndConditionsHelper = termsAndConditionsHelper;
    }

    public void setUserManager(UserManager userManager) {
        this.userManager = userManager;
    }



    // ----------------------------------------------------------------------------------------------------- Injectables

    /**
     * Makes an API call to Gigya's servers (socialize.notifyLogin) with the siteUID and targetEnv to sign the user in
     * @param siteUID
     * @param targetEnv
     * @return
     * @throws GSKeyNotFoundException
     */
    public LoginObj notifyLogin(String siteUID, boolean newUser, Object user, String targetEnv) throws GSKeyNotFoundException{
        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("siteUID",  siteUID);
        params.put("cid", GIGYA_CID);
        params.put("newUser",  newUser);

        if(newUser){
            params.put("userInfo", (String) user);
        }
        return authentication("socialize.notifyLogin", targetEnv, params);
    }

    /**
     * Makes an API call to Gigya's servers (socialize.logout) with the siteUID and targetEnv to sign the user out
     * @param siteUID
     * @param targetEnv
     * @return
     * @throws GSKeyNotFoundException
     */
    public GSResponse notifyLogout(String siteUID, String targetEnv) throws GSKeyNotFoundException{
        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("uid",  siteUID);
        params.put("cid", GIGYA_CID);
        params.put("forceProvidersLogout", true);
        return call("socialize.logout", targetEnv, params);
    }

    /**
     * Makes an API call to Gigyas servers (socizalize.notifyRegistration) notifying of a new registration.
     * @param siteUID
     * @param targetEnv
     * @return
     * @throws GSKeyNotFoundException
     */
    public GSResponse notifyRegistration(String siteUID, String targetEnv) throws GSKeyNotFoundException{
        HashMap<String, Object> params = new HashMap<String, Object>();
        params.put("uid",  siteUID);
        params.put("cid", GIGYA_CID);
            return call("socialize.notifyRegistration", targetEnv, params);
    }

    /**
     *
     * @param callingUserID - the iD of the user calling the service
     * @return
     */
    private Boolean isValidatedUser(String callingUserID){
        Long userID = authenticationProvider.getJiveUser().getID();

        if(userID == null || callingUserID == null || callingUserID == "")
            return false;

        if(callingUserID.equals(userID.toString()))
            return true;

        return false;
    }

    /**
     * A generic method that takes the API method call, the siteUID and the targetEnv and makes an API call to Gigya's server
     * @param method
     * @param targetEnv
     * @return
     * @throws GSKeyNotFoundException
     */
    public LoginObj authentication(String method, String targetEnv, Map<String, Object> params) throws GSKeyNotFoundException {
        String sessionToken;
        String sessionSecret;

        // Step 1 - Define the request
        GSRequest request = new GSRequest(gigyaApi.getGigyaConfiguration().getApiKey(), gigyaApi.getGigyaConfiguration().getApplicationSecret(), method);

        // Step 2 - Adding parameters
        for(String key: params.keySet()){
            request.setParam(key, String.valueOf(params.get(key)));
        }

        if(targetEnv != null && !targetEnv.equals(""))
            request.setParam("targetEnv",  targetEnv);

        //request.setUseHTTPS(true);

        // Step 3 - Sending the request
        GSResponse response = request.send();

        // Step 4 - handling the requests response
        if(response.getErrorCode() == 0 && method.equals("socialize.notifyLogin")){
            // SUCCESS!!
            log.debug("user: " + (String) params.get("siteUID") + "logged in \n");

            sessionToken = response.getData().getString("sessionToken");
            sessionSecret = response.getData().getString("sessionSecret");

            String timestamp =  response.getData().getString("signatureTimestamp");
            String UIDSignature =  response.getData().getString("UIDSignature");
            String UID =  response.getData().getString("UID");

            //validate
            try {
                if(isValidSignature(timestamp, UID, SECRET_KEY, UIDSignature)){
                    LoginObj loginObj = new LoginObj(sessionToken, sessionSecret);
                    return loginObj;
                }
            } catch (InvalidKeyException e) {
                e.printStackTrace();
                return null;
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
                return null;
            }
        }else if(response.getErrorCode() == 0 && method.equals("socialize.logout")){
            log.debug("user: " + (String) params.get("siteUID") + "logged out \n");
            return null;
        }else{
            log.debug("Got an error: \n" + response.getLog());
            return null;
        }
        return null;
    }

    /**
     * A Generic method that can be used to invoke other Gigya services
     * @param method
     * @param targetEnv
     * @return
     * @throws GSKeyNotFoundException
     */
    public GSResponse call(String method, String targetEnv, Map<String, Object> params) throws GSKeyNotFoundException{
        // Step 1 - Define the request
        GSRequest request = new GSRequest(gigyaApi.getGigyaConfiguration().getApiKey(), gigyaApi.getGigyaConfiguration().getApplicationSecret(), method);

        // Step 2 - Adding parameters
        for(String key: params.keySet()){
            request.setParam(key, (String)  params.get(key));
        }

        // Step 3 - Sending the request
        GSResponse response = request.send();

        // Step 4 - handling the requests response
        if(response.getErrorCode() == 0){
            // SUCCESS!!
            log.debug("successfully performed the operation: " + method);
            return response;
        }else{
            log.debug("Got an error: \n" + response.getLog());
            return null;
        }
    }

    @Required
    public void setGigyaApi(GigyaApi gigyaApi) {
        this.gigyaApi = gigyaApi;
    }

    @Required
    public void setActivityProvider(ActivityProvider activityProvider) {
        this.activityProvider = activityProvider;
    }

    @Required
    public void setCommonContentProvider(CommonContentProvider commonContentProvider) {
        this.commonContentProvider = commonContentProvider;
    }

    @Required
    public void setPersonProvider(PersonProvider personProvider) {
        this.personProvider = personProvider;
    }

    @Required
    public void setProfileImageProvider(ProfileImageProvider profileImageProvider) {
        this.profileImageProvider = profileImageProvider;
    }

    @Required
    public void setStreamProvider(StreamProvider streamProvider) {
        this.streamProvider = streamProvider;
    }

    public AvatarManager getAvatarManager() {
        return avatarManager;
    }

    // -------------------------------------------------------------------------------------------- Variables and access methods for extensions

    public void setAvatarManager(AvatarManager avatarManager) {
        this.avatarManager = avatarManager;
    }

    public ImageManager getImageManager() {
        return imageManager;
    }

    public void setImageManager(ImageManager imageManager) {
        this.imageManager = imageManager;
    }

	/**
	 * @return the inviteService
	 */
	public InviteService getInviteService() {
		return inviteService;
	}

	/**
	 * @param inviteService the inviteService to set
	 */
	public void setInviteService(InviteService inviteService) {
		this.inviteService = inviteService;
	}

    public InviteProvider getInviteProvider() {
        return inviteProvider;
    }

    public void setInviteProvider(InviteProvider inviteProvider) {
        this.inviteProvider = inviteProvider;
    }

    /**
	 * @param streamConfigurationService the streamConfigurationService to set
	 */
	public void setStreamConfigurationService(
			StreamConfigurationService streamConfigurationService) {
		this.streamConfigurationService = streamConfigurationService;
	}

    // ------------------------------------------------------------------------------------------------ Support Classes

	/**
	 * @param inboxManager the inboxManager to set
	 */
	public void setInboxManager(InboxManager inboxManager) {
		this.inboxManager = inboxManager;
	}

    /**
     * A Function taken from the PhotoService to temporarily store an image.
     * @param data
     * @param tempImageDir
     * @return
     * @throws IOException
     */
    private File writeToTempFile(InputStream data, File tempImageDir) throws IOException {
        File tempFile = File.createTempFile("temp", ".temp", tempImageDir);


        FileOutputStream fos = null;
        try {
            fos = new FileOutputStream(tempFile);
            IOUtils.copyLarge(data, fos);
        } finally {
            IOUtils.closeQuietly(fos);
        }

        return tempFile;
    }

    public enum Status {
        FRIEND, ONYOOKOS, NONE, PENDING, INVITED
    }

    public static class Invitees {
        public List<String> emails;
        public String message;

        public Invitees(List<String> emails, String message) {
            this.emails = emails;
            this.message = message;
        }


        public  Invitees() {}

        private List<String> getEmails() {
            return emails;
        }

        private void setEmails(List<String> emails) {
            this.emails = emails;
        }

        private String getMessage() {
            return message;
        }

        private void setMessage(String message) {
            this.message = message;
        }
    }

    public static class InviteResults {
        public List<ProcessedEmail> processedEmails;
        public List<String> invitedUserEmails;

        public InviteResults(List<String> invitedUserEmails, List<ProcessedEmail> processedEmails) {
            this.invitedUserEmails = invitedUserEmails;
            this.processedEmails = processedEmails;
        }

        public List<String> getInvitedUserEmails() {
            return invitedUserEmails;
        }

        public void setInvitedUserEmails(List<String> invitedUserEmails) {
            this.invitedUserEmails = invitedUserEmails;
        }

        public List<ProcessedEmail> getProcessedEmails() {
            return processedEmails;
        }

        public void setProcessedEmails(List<ProcessedEmail> processedEmails) {
            this.processedEmails = processedEmails;
        }
    }

    private static class NotificationConfiguration{
        private boolean status;
        private String type;

        public NotificationConfiguration(boolean status, String type) {
            this.status = status;
            this.type = type;
        }

        public NotificationConfiguration(){}

        public boolean isStatus() {
            return status;
        }

        public void setStatus(boolean status) {
            this.status = status;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }

    /**
     * A simple class that stores the secretToken and sessionSecret for use in the mobile application
     */
    private static class LoginObj{
        private String secretToken;
        private String sessionSecret;

        public LoginObj(String t, String s){
            this.secretToken = t;
            this.sessionSecret = s;
        }

        public String getSecretToken() {
            return secretToken;
        }

        public void setSecretToken(String secretToken) {
            this.secretToken = secretToken;
        }

        public String getSessionSecret() {
            return sessionSecret;
        }

        public void setSessionSecret(String sessionSecret) {
            this.sessionSecret = sessionSecret;
        }
    }

    private class ProcessedEmails{
        public List<ProcessedEmail> list;


        private ProcessedEmails(List<ProcessedEmail> list) {
            this.list = list;
        }

        public  List<ProcessedEmail> getList() {
            return list;
        }
    }

    public class ProcessedEmail{
        public String name;
        public Long userID;
        public String email;
        public Status status;
        public String username;
        public String avatarURL;

        public ProcessedEmail(String email, Status status) {
            this.email = email;
            this.status = status;
        }

        public ProcessedEmail(Long userID, String email, String name, Status status, String username) {
            this.email = email;
            this.name = name;
            this.status = status;
            this.userID = userID;
            this.username = username;
        }

        public ProcessedEmail(User user, Status status) {
            this.email = user.getEmail();
            this.name = user.getName();
            this.status = status;
            this.userID = user.getID();
            this.username = user.getUsername();
        }

        public String getEmail() {
            return email;
        }

        public Status getStatus() {
            return status;
        }

        public String getName() {
            return name;
        }

        public Long getUserID() {
            return userID;
        }

        public String getUsername() {
            return username;
        }

        public String getAvatarURL() {
            return avatarURL;
        }
    }
}