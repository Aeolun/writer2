import { Component } from "solid-js";
import { SnowflakeView } from "../components/snowflake/SnowflakeView";
import { WriteHeaderMenu } from "../components/WriteHeaderMenu";

const Snowflake: Component = () => {
  return (
    <div class="flex flex-col h-full">
      <WriteHeaderMenu />
      <div class="flex-1 relative overflow-auto">
        <SnowflakeView />
      </div>
    </div>
  );
};

export default Snowflake;
