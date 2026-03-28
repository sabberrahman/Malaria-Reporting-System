import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocalRecordsGrid from "@/components/LocalRecordsGrid";
import NonLocalRecordsGrid from "@/components/NonLocalRecordsGrid";
import { useState } from "react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("local");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="app-shell min-h-screen">
      <main className="mx-auto w-full max-w-[1800px] p-3 sm:p-4 md:p-6">
        <section className="report-surface overflow-hidden rounded-[2rem]">
          <div className="flex flex-col gap-4 border-b border-border/70 px-4 py-4 sm:px-5 md:px-7">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Public reporting register</p>
                <h1 className="font-display mt-2 text-3xl text-foreground">Annual case submission tables</h1>
                {/* <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  This branch opens directly into the full reporting register with no login, no admin workspace, and no account controls.
                </p> */}
              </div>
              <div className="status-pill inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                {activeTab === "local" ? "Local records in focus" : "Non-local records in focus"}
              </div>
            </div>

            <TabsList className="grid h-auto w-full grid-cols-2 rounded-full bg-secondary/80 p-1 sm:w-fit">
              <TabsTrigger value="local" className="px-4 py-2">
                Local
              </TabsTrigger>
              <TabsTrigger value="non-local" className="px-4 py-2">
                Non-Local
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-3 py-3 sm:px-4 md:px-6 md:py-5">
            <TabsContent value="local" className="m-0">
              <div className="data-grid-shell overflow-hidden p-1 sm:p-2 rounded-[1.5rem]">
                <LocalRecordsGrid />
              </div>
            </TabsContent>

            <TabsContent value="non-local" className="m-0">
              <div className="data-grid-shell overflow-hidden p-1 sm:p-2 rounded-[1.5rem]">
                <NonLocalRecordsGrid />
              </div>
            </TabsContent>
          </div>
        </section>
      </main>
    </Tabs>
  );
};

export default Dashboard;
