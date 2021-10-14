package com.linkedin.datahub.graphql.analytics.resolver;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.linkedin.datahub.graphql.analytics.service.AnalyticsService;
import com.linkedin.datahub.graphql.generated.DateRange;
import com.linkedin.datahub.graphql.generated.Highlight;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.joda.time.DateTime;


/**
 * Retrieves the Highlights to be rendered of the Analytics screen of the DataHub application.
 */
public final class GetHighlightsResolver implements DataFetcher<List<Highlight>> {

  private final AnalyticsService _analyticsService;

  public GetHighlightsResolver(final AnalyticsService analyticsService) {
    _analyticsService = analyticsService;
  }

  @Override
  public final List<Highlight> get(DataFetchingEnvironment environment) throws Exception {
    return getHighlights();
  }

  /**
   * TODO: Config Driven Charts Instead of Hardcoded.
   */
  private List<Highlight> getHighlights() {
    final List<Highlight> highlights = new ArrayList<>();

    DateTime endDate = DateTime.now();
    DateTime startDate = endDate.minusWeeks(1);
    DateTime lastWeekStartDate = startDate.minusWeeks(1);
    DateRange dateRange = new DateRange(String.valueOf(startDate.getMillis()), String.valueOf(endDate.getMillis()));
    DateRange dateRangeLastWeek =
        new DateRange(String.valueOf(lastWeekStartDate.getMillis()), String.valueOf(startDate.getMillis()));

    // Highlight 1: The Highlights!
    String title = "周活跃用户数";
    String eventType = "SearchEvent";

    int weeklyActiveUsers =
        _analyticsService.getHighlights(AnalyticsService.DATAHUB_USAGE_EVENT_INDEX, Optional.of(dateRange),
            ImmutableMap.of(), ImmutableMap.of(), Optional.of("browserId"));

    int weeklyActiveUsersLastWeek =
        _analyticsService.getHighlights(AnalyticsService.DATAHUB_USAGE_EVENT_INDEX, Optional.of(dateRangeLastWeek),
            ImmutableMap.of(), ImmutableMap.of(), Optional.of("browserId"));

    String bodyText = "";
    if (weeklyActiveUsersLastWeek > 0) {
      Double percentChange =
          (Double.valueOf(weeklyActiveUsers) - Double.valueOf(weeklyActiveUsersLastWeek)) / Double.valueOf(
              weeklyActiveUsersLastWeek) * 100;

      String directionChange = percentChange > 0 ? "增加" : "减少";

      bodyText = Double.isInfinite(percentChange) ? ""
          : String.format("相比上周，%s %.2f%%  ", directionChange, percentChange);
    }

    highlights.add(Highlight.builder().setTitle(title).setValue(weeklyActiveUsers).setBody(bodyText).build());

    // Entity metdata statistics
    highlights.add(getEntityMetadataStats("数据表", AnalyticsService.DATASET_INDEX));
    highlights.add(getEntityMetadataStats("仪表盘", AnalyticsService.DASHBOARD_INDEX));
    highlights.add(getEntityMetadataStats("图表", AnalyticsService.CHART_INDEX));
    highlights.add(getEntityMetadataStats("管道", AnalyticsService.DATA_FLOW_INDEX));
    highlights.add(getEntityMetadataStats("任务", AnalyticsService.DATA_JOB_INDEX));
    return highlights;
  }

  private Highlight getEntityMetadataStats(String title, String index) {
    int numEntities = _analyticsService.getHighlights(index, Optional.empty(), ImmutableMap.of(),
        ImmutableMap.of("removed", ImmutableList.of("true")), Optional.empty());
    int numEntitiesWithOwners =
        _analyticsService.getHighlights(index, Optional.empty(), ImmutableMap.of("hasOwners", ImmutableList.of("true")),
            ImmutableMap.of("removed", ImmutableList.of("true")), Optional.empty());
    String bodyText = "";
    if (numEntities > 0) {
      double percentChange = 100.0 * numEntitiesWithOwners / numEntities;
      bodyText = String.format("%.2f%% 指定了所有者!", percentChange);
    }
    return Highlight.builder().setTitle(title).setValue(numEntities).setBody(bodyText).build();
  }
}
