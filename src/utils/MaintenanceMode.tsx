import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import supportedLanguages from "../assets/data/supported-languages.json";
import { deepEqual, PermissionContext } from "components-care";
import { useTranslation } from "react-i18next";
import { usePermissionContext } from "components-care/dist";
import i18n from "../i18n";
import MaintenancePage from "../components/maintenance/MaintenancePage";

export enum MaintenanceType {
  Off = "off",
  ReadOnly = "read-only",
  Full = "full",
}

export interface MaintenanceEntry {
  start: Date;
  end: Date | null;
  reason: Record<string, string>;
  reason_long?: null | Record<string, string>;
  type: MaintenanceType;
}

export interface MaintenanceState {
  current: null | MaintenanceEntry;
  planned: MaintenanceEntry[];
}

export interface MaintenanceEntryJSON {
  start: string; // ISO date
  end: string | null; // ISO date
  reason: Record<string, string>;
  reason_long?: null | Record<string, string>;
  type: MaintenanceType;
}

export interface MaintenanceStateJSON {
  current: null | MaintenanceEntryJSON;
  planned: MaintenanceEntryJSON[];
}

const MaintenanceInfoContext = React.createContext<MaintenanceState>({
  current: null,
  planned: [],
});
const fetchInterval = 30000; // 30sec

const decodeMaintenanceEntry = (
  data: MaintenanceEntryJSON,
): MaintenanceEntry => {
  return {
    ...data,
    start: new Date(data.start),
    end: data.end ? new Date(data.end) : null,
  };
};

export const getLocalizedReason = (data: Record<string, string>): string => {
  if (i18n.language in data) return data[i18n.language];
  const lang = i18n.language.split("-")[0];
  if (lang in data) return data[lang];
  return data["en"];
};

export interface MaintenanceModeProviderProps {
  children: React.ReactNode;
}

export const MaintenanceModeProvider = (
  props: MaintenanceModeProviderProps,
) => {
  const { children } = props;
  const { t } = useTranslation("common");
  const [perms, setPerms] = usePermissionContext();
  const fetchThread = useRef(-1);
  const maintenanceInfo = useRef<MaintenanceState | null>(null);
  const [loadPromise, setLoadPromise] =
    useState<Promise<MaintenanceState> | null>(null);
  const [maintenanceInfoValue, setMaintenanceInfoValue] =
    useState<MaintenanceState | null>(null);

  const fetchMaintenanceState = useCallback(async () => {
    if (localStorage.NO_MAINTENANCE_MODE === "true") {
      maintenanceInfo.current = {
        current: null,
        planned: [],
      };
    } else {
      try {
        const resp = await window.fetch("/api/v1/maintenance");
        const data: Record<"identity_management", MaintenanceStateJSON> =
          await resp.json();
        maintenanceInfo.current = {
          current: data.identity_management.current
            ? decodeMaintenanceEntry(data.identity_management.current)
            : null,
          planned: data.identity_management.planned.map(decodeMaintenanceEntry),
        };
      } catch (e) {
        console.error(e);
        if (!maintenanceInfo.current) {
          maintenanceInfo.current = {
            current: {
              start: new Date(),
              end: null,
              reason: Object.fromEntries(
                supportedLanguages.map((lang: string) => [
                  lang,
                  t("maintenance.fetch-fail-reason", { lng: lang }),
                ]),
              ),
              reason_long: {
                en: "`" + (e as Error).message + "`",
              },
              type: MaintenanceType.Full,
            },
            planned: [],
          };
        }
      }
    }
    setMaintenanceInfoValue((prev) =>
      prev && deepEqual(prev, maintenanceInfo.current)
        ? prev
        : maintenanceInfo.current,
    );
    return maintenanceInfo.current;
  }, [t]);

  const fetchHandler = useCallback(() => {
    setLoadPromise(fetchMaintenanceState());
  }, [fetchMaintenanceState]);

  useEffect(() => {
    fetchHandler();
    fetchThread.current = window.setInterval(fetchHandler, fetchInterval);

    return () => {
      window.clearInterval(fetchThread.current);
      fetchThread.current = -1;
    };
  }, [fetchHandler]);

  // suspend until data available
  if (!maintenanceInfoValue && loadPromise) throw loadPromise;
  if (!maintenanceInfoValue) return <React.Fragment />;

  const currentMaintenanceType =
    maintenanceInfoValue.current?.type ?? MaintenanceType.Off;
  const permFilterPredicate = () => {
    switch (currentMaintenanceType) {
      case MaintenanceType.Off:
      case MaintenanceType.ReadOnly:
        return true;
      case MaintenanceType.Full:
        return false;
    }
  };
  const permMappingPredicate = (perm: string) => {
    switch (currentMaintenanceType) {
      case MaintenanceType.Off:
      case MaintenanceType.Full:
        return perm;
      case MaintenanceType.ReadOnly:
        return perm.endsWith(".reader") || perm.endsWith(".consumer")
          ? perm
          : perm + "-maintenance-disabled";
    }
  };
  const extraPerms: string[] = ["maintenance." + currentMaintenanceType];

  return (
    <MaintenanceInfoContext.Provider value={maintenanceInfoValue}>
      <PermissionContext.Provider
        value={[
          perms
            .filter(permFilterPredicate)
            .map(permMappingPredicate)
            .concat(extraPerms),
          setPerms,
        ]}
      >
        {currentMaintenanceType === MaintenanceType.Full ? (
          <MaintenancePage />
        ) : (
          children
        )}
      </PermissionContext.Provider>
    </MaintenanceInfoContext.Provider>
  );
};

export const useMaintenanceInfo = () => {
  return useContext(MaintenanceInfoContext);
};

export default MaintenanceModeProvider;
