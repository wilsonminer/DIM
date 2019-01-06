import * as React from 'react';
import { DimItem } from '../inventory/item-types';
import { D2ItemUserReview } from './d2-dtr-api-types';
import { D1ItemUserReview } from './d1-dtr-api-types';
import { AppIcon, thumbsUpIcon, thumbsDownIcon } from '../shell/icons';
import { faPenSquare, faExclamationTriangle, faBan } from '@fortawesome/free-solid-svg-icons';
import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { t } from 'i18next';
import classNames from 'classnames';
import { StarRatingDisplay } from '../shell/star-rating/StarRatingDisplay';
import { dimDestinyTrackerService } from './destiny-tracker.service';
import { D2ReviewMode } from '../destinyTrackerApi/reviewModesFetcher';
import { translateReviewMode } from './reviewModeTranslator';

interface Props {
  item: DimItem;
  review: D2ItemUserReview | D1ItemUserReview;
  reviewModeOptions?: D2ReviewMode[];
  onEditReview(review: D2ItemUserReview | D1ItemUserReview): void;
}

interface State {
  flagged?: boolean;
}

/** A single item review. */
export default class ItemReview extends React.Component<Props, State> {
  state: State = {};

  render() {
    const { item, review, reviewModeOptions } = this.props;
    const { flagged } = this.state;

    // TODO: these are totally different between D1/D2, but should be merged!

    return (
      <div className="community-review">
        <div>
          <div
            className={classNames({
              'link community-review--clickable': review.isReviewer
            })}
            onClick={this.editReview}
          >
            <div className="community-review--who">
              {isD1Review(item, review) ? (
                <StarRatingDisplay rating={review.rating} />
              ) : (
                <>
                  {review.voted === 1 && (
                    <div>
                      <span className="community-review--thumbs-up">
                        <AppIcon icon={thumbsUpIcon} />
                      </span>
                    </div>
                  )}
                  {review.voted === -1 && (
                    <div>
                      <span className="community-review--thumbs-down">
                        <AppIcon icon={thumbsDownIcon} />
                      </span>
                    </div>
                  )}
                </>
              )}
              <div
                className={classNames({
                  'community-review--who__special': review.isHighlighted
                })}
              >
                {review.reviewer.displayName}
              </div>
              <div>{review.timestamp.toLocaleDateString()}</div>
              {!item.isVendorItem && (
                <a
                  className="community-review--clickable"
                  onClick={review.isReviewer ? this.openFlagContext : this.editReview}
                >
                  <AppIcon icon={review.isReviewer ? faPenSquare : faFlag} />
                </a>
              )}
            </div>
            {isD2Review(item, review) && reviewModeOptions && (
              <div className="community-review--game-mode">
                <div className="community-review--game-mode-for">{t('DtrReview.ForGameMode')}</div>
                <div className="community-review--game-mode" ng-bind="translateReviewMode(review)">
                  {translateReviewMode(reviewModeOptions, review)}
                </div>
              </div>
            )}
            <div className="community-review--review">
              {isD2Review(item, review) ? review.text : review.review}
            </div>
          </div>
          {flagged && (
            <div className="community-revew--report-container">
              <div className="community-review--report">
                <AppIcon icon={faExclamationTriangle} />
                {t('DtrReview.VerifyReport')}
              </div>
              <div className="community-review--report-buttons">
                <button
                  className="dim-button community-review--report-yes"
                  onClick={this.reportReview}
                >
                  <AppIcon icon={faFlag} />
                  {t('DtrReview.ReallyReport')}
                </button>
                <button
                  className="dim-button community-review--report-cancel"
                  onClick={this.closeFlagContext}
                >
                  <AppIcon icon={faBan} /> {t('DtrReview.Cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  private editReview = () => {
    const { review, onEditReview } = this.props;
    if (!review.isReviewer) {
      return;
    }

    onEditReview(review);
  };

  private openFlagContext = () => {
    const { review } = this.props;

    if (review.isReviewer || review.isHighlighted) {
      return;
    }

    this.setState({ flagged: true });
  };

  private closeFlagContext = () => {
    this.setState({ flagged: false });
  };

  private reportReview = () => {
    const { review } = this.props;
    dimDestinyTrackerService.reportReview(review);
  };
}

export function isD1Review(
  item: DimItem,
  _review: D2ItemUserReview | D1ItemUserReview
): _review is D1ItemUserReview {
  return item.isDestiny1();
}

export function isD2Review(
  item: DimItem,
  _review: D2ItemUserReview | D1ItemUserReview
): _review is D2ItemUserReview {
  return item.isDestiny2();
}