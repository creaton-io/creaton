import * as React from "react";
import CreatorCard from "../CreatorCard/CreatorCard";
import { StyledContainer } from "./CreatorCardContainer.styles";
import { Pivot, PivotItem } from "@fluentui/react";
import { mock } from "./CreatorCardContainer.mocks";

const CreatorCardContainer = () => {
  const getCards = () =>
    mock.map((item) => (
      <CreatorCard
        topImage={item.topImage}
        bottomImage={item.bottomImage}
        count={item.count}
        price={item.price}
        title={item.title}
        key={item.id}
      />
    ));
  return (
    <div>
      <Pivot
        styles={{
          link: { color: "#fff", fontFamily: "Avenir !important" },
          linkIsSelected: { "::before": { backgroundColor: "#35cc82" } },
          root: {
            marginBottom: "40px",
            marginTop: "20px",
            overflowX: "auto",
            overflowY: "hidden",
          },
        }}
      >
        <PivotItem headerText="Trending"></PivotItem>
        <PivotItem headerText="Top"></PivotItem>
        <PivotItem headerText="Art"></PivotItem>
        <PivotItem headerText="Collectibles"></PivotItem>
        <PivotItem headerText="Music"></PivotItem>
        <PivotItem headerText="Photography"></PivotItem>
      </Pivot>
      <StyledContainer>{getCards()}</StyledContainer>
    </div>
  );
};

export default CreatorCardContainer;