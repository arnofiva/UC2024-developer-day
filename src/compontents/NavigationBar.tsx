import { tsx } from "@arcgis/core/widgets/support/widget";

import AppStore from "../stores/AppStore";

import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-chip";
import "@esri/calcite-components/dist/components/calcite-menu";
import "@esri/calcite-components/dist/components/calcite-menu-item";
import "@esri/calcite-components/dist/components/calcite-navigation";
import "@esri/calcite-components/dist/components/calcite-navigation-logo";
import "@esri/calcite-components/dist/components/calcite-navigation-user";

const NavigationBar = ({ store }: { store: AppStore }) => {
  const userStore = store.userStore;

  const user = (userStore.authenticated && userStore.user) || null;

  return (
    <calcite-navigation slot="header">
      <calcite-navigation-logo
        slot="logo"
        heading={store.title}
        description="ArcGIS Maps SDK for JavaScript"
        thumbnail="./icon-64.svg"
        onclick={() => {
          const portalItem = store.sceneStore.map.portalItem;
          const itemPageUrl = portalItem.itemPageUrl;
          if (itemPageUrl) {
            window.open(itemPageUrl, "new");
          }
        }}
      ></calcite-navigation-logo>
      <calcite-menu slot="content-start">
        <calcite-menu-item
          iconStart="information"
          onclick={() => (store.isStartupDialogShown = true)}
        ></calcite-menu-item>
      </calcite-menu>

      {user ? (
        <calcite-navigation-user
          slot="user"
          thumbnail={user.thumbnailUrl}
          full-name={user.fullName}
          username={user.username}
        ></calcite-navigation-user>
      ) : (
        <calcite-menu slot="content-end">
          <calcite-menu-item
            onclick={() => userStore?.signIn()}
            text="Sign in"
            icon-start="user"
            text-enabled
          ></calcite-menu-item>
        </calcite-menu>
      )}
    </calcite-navigation>
  );
};

export default NavigationBar;
