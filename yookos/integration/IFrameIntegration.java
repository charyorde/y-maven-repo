package com.yookos.integration;

import com.google.common.collect.Maps;
import com.jivesoftware.base.User;
import com.jivesoftware.community.JiveGlobals;
import com.jivesoftware.community.annotations.PropertyNames;
import com.jivesoftware.community.browse.rest.ItemBeanBuilder;
import com.jivesoftware.community.user.rest.UserItemBean;
import com.jivesoftware.community.widget.*;
import com.jivesoftware.util.StringUtils;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: emile
 * Date: 10/23/13
 * Time: 9:30 AM
 * To change this template use File | Settings | File Templates.
 */

@PropertyNames("iframeURL")
@WidgetTypeMarker({WidgetType.COMMUNITY, WidgetType.HOMEPAGE})
@WidgetCategoryMarker({WidgetCategory.PEOPLE, WidgetCategory.OTHER})

public class IFrameIntegration extends BaseWidget {
    private static final String SOY_TEMPLATE = "com.yookos.integration.main";
    Map<String, Object> view;            //our view
    protected ItemBeanBuilder<User, UserItemBean> userItemBeanBuilder;
    public String iframeURL = "http://chat.yookos.com/data/default-page.html";

    protected List<String> acceptedDomains;

    @Override
    public String getTitle(WidgetContext widgetContext) {
        // TODO Auto-generated method stub
        return "iFrame Integration Widget";
    }

    @Override
    public String getDescription(WidgetContext widgetContext) {
        // TODO Auto-generated method stub
        return "A plugin that allows vetted websites to be loaded through a custom iFrame.";
    }

    @Override
    public String render(WidgetContext widgetContext, ContainerSize size) {
        return this.applySoyTemplate(widgetContext, size,
                SOY_TEMPLATE);
    }


    @Override
    protected Map<String, Object> loadPropertiesForSoy(WidgetContext widgetContext, ContainerSize size) {
        view = new HashMap<String, Object>();
        view.put("user", toUserBean(widgetContext.getUser()));
        view.put("link", getIframeURL());   // test for http:// <- this must be there
        view.put("allowed", isAllowedDomainEmbed(getIframeURL()));
        return view;
    }

    /**
     * CP-5: checks if a given URL is in our white-list
     *
     * @param URL
     * @return
     */
    private  boolean isAllowedDomainEmbed(String URL) {
        if (!StringUtils.isNullOrEmpty(URL)) {
            try {
                return getAcceptedDomains().contains(
                        getDomainName(URL)
                );
            } catch (URISyntaxException e) {
                e.printStackTrace();
                return false;
            } catch (NullPointerException npe){
                npe.printStackTrace();
                return false;
            }
        }

        return false;
    }

    public static String getDomainName(String url) throws URISyntaxException {
        URI uri = new URI(url);
        String domain = uri.getHost();
        return domain.startsWith("www.") ? domain.substring(4) : domain;
    }

    public UserItemBean toUserBean(User u) {
        return userItemBeanBuilder.build(u, u, UserItemBean.DEFAULT_USER_PROPERTIES,
                Maps.<String, Object>newHashMap());
    }

    public String getIframeURL() {
        if(null != iframeURL && !iframeURL.startsWith("http://")) {
            StringBuilder Url = new StringBuilder("http://").append(iframeURL);
            iframeURL = Url.toString();
        }

        return iframeURL;
    }

    public void setIframeURL(String iframeURL) {
        this.iframeURL = iframeURL;
    }

    public ItemBeanBuilder<User, UserItemBean> getUserItemBeanBuilder() {
        return userItemBeanBuilder;
    }

    public void setUserItemBeanBuilder(
            ItemBeanBuilder<User, UserItemBean> userItemBeanBuilder) {
        this.userItemBeanBuilder = userItemBeanBuilder;
    }

    /**
     * CP-5: Gets a white-list of domains to render in the iframe
     * TODO: check out white-list data structure?
     *
     * @return
     * @throws NullPointerException
     * @author Emile Senga
     * @date   November 2012
     */
    public List<String> getAcceptedDomains() throws NullPointerException{
        if(acceptedDomains == null || isDomainsUpdated()) {
            acceptedDomainsList = JiveGlobals.getJiveProperty(DOMAINS_LIST);
            if (StringUtils.isBlank(acceptedDomainsList) || StringUtils.isEmpty(acceptedDomainsList))
                throw new NullPointerException("No domains provided.");

            String[] domains = acceptedDomainsList.split(",");
            acceptedDomains = Arrays.asList(domains);
        }

        return acceptedDomains;
    }

    public void setAcceptedDomains(List<String> acceptedDomains) {
        this.acceptedDomains = acceptedDomains;
    }

    private static final String DOMAINS_LIST = "accepted.integration.domains";
    String acceptedDomainsList = JiveGlobals.getJiveProperty(DOMAINS_LIST);

    private boolean isDomainsUpdated() {
        return !acceptedDomainsList.equals(JiveGlobals.getJiveProperty(DOMAINS_LIST));
    }
}
