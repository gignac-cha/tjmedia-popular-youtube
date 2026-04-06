import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import type { GenreType, SearchForm } from '../../types/tjmedia.ts';
import { buildTodayDateRange, buildThisMonthDateRange } from '../../tools/dates.ts';
import { Subtitle, SegmentedControl, SegmentButton } from '../shared/styles.ts';
import { BottomSheet } from '../shared/BottomSheet.tsx';
import {
  StyledHeader,
  HeaderTop,
  TitleGroup,
  Title,
  MobileFilterToggle,
  DesktopControls,
  FilterGroup,
  DateControls,
  CustomDateContainer,
  Input,
  ResetButton,
} from './styles.ts';

export function Header({
  searchForm,
  onSearchFormChange,
}: {
  searchForm: SearchForm;
  onSearchFormChange: (next: SearchForm) => void;
}) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [draftStartDate, setDraftStartDate] = useState(searchForm.searchStartDate);
  const [draftEndDate, setDraftEndDate] = useState(searchForm.searchEndDate);

  const handleStrTypeChange = useCallback(
    (strType: GenreType) => {
      onSearchFormChange({ ...searchForm, strType });
      setIsBottomSheetOpen(false);
    },
    [searchForm, onSearchFormChange],
  );

  const handlePresetToday = useCallback(() => {
    const dateRange = buildTodayDateRange();
    setDraftStartDate(dateRange.searchStartDate);
    setDraftEndDate(dateRange.searchEndDate);
    onSearchFormChange({ ...searchForm, ...dateRange });
    setShowCustomDate(false);
    setIsBottomSheetOpen(false);
  }, [searchForm, onSearchFormChange]);

  const handlePresetThisMonth = useCallback(() => {
    const dateRange = buildThisMonthDateRange();
    setDraftStartDate(dateRange.searchStartDate);
    setDraftEndDate(dateRange.searchEndDate);
    onSearchFormChange({ ...searchForm, ...dateRange });
    setShowCustomDate(false);
    setIsBottomSheetOpen(false);
  }, [searchForm, onSearchFormChange]);

  const handleReset = useCallback(() => {
    const dateRange = buildThisMonthDateRange();
    setDraftStartDate(dateRange.searchStartDate);
    setDraftEndDate(dateRange.searchEndDate);
    onSearchFormChange({
      chartType: 'TOP',
      strType: '1',
      ...dateRange,
    });
    setShowCustomDate(false);
    setIsBottomSheetOpen(false);
  }, [onSearchFormChange]);

  const handleCustomDateApply = useCallback(() => {
    onSearchFormChange({
      ...searchForm,
      searchStartDate: draftStartDate,
      searchEndDate: draftEndDate,
    });
    setIsBottomSheetOpen(false);
  }, [searchForm, draftStartDate, draftEndDate, onSearchFormChange]);

  const todayRange = buildTodayDateRange();
  const thisMonthRange = buildThisMonthDateRange();

  const isToday =
    searchForm.searchStartDate === todayRange.searchStartDate &&
    searchForm.searchEndDate === todayRange.searchEndDate;

  const isThisMonth =
    searchForm.searchStartDate === thisMonthRange.searchStartDate &&
    searchForm.searchEndDate === thisMonthRange.searchEndDate;

  const filterControls = (
    <FilterGroup>
      <SegmentedControl>
        <SegmentButton
          isActive={searchForm.strType === '1'}
          onClick={() => handleStrTypeChange('1')}
        >
          가요
        </SegmentButton>
        <SegmentButton
          isActive={searchForm.strType === '2'}
          onClick={() => handleStrTypeChange('2')}
        >
          POP
        </SegmentButton>
        <SegmentButton
          isActive={searchForm.strType === '3'}
          onClick={() => handleStrTypeChange('3')}
        >
          J-POP
        </SegmentButton>
      </SegmentedControl>

      <DateControls>
        <SegmentedControl>
          <SegmentButton
            isActive={isToday && !showCustomDate}
            onClick={handlePresetToday}
          >
            Today
          </SegmentButton>
          <SegmentButton
            isActive={isThisMonth && !showCustomDate}
            onClick={handlePresetThisMonth}
          >
            This Month
          </SegmentButton>
          <SegmentButton
            isActive={showCustomDate || (!isToday && !isThisMonth)}
            onClick={() => setShowCustomDate(true)}
          >
            Custom{' '}
            <FontAwesomeIcon
              icon={faCalendarAlt}
              style={{ marginLeft: '4px' }}
            />
          </SegmentButton>
        </SegmentedControl>

        {(showCustomDate || (!isToday && !isThisMonth)) && (
          <CustomDateContainer data-testid="custom-date-container">
            <Input
              type="date"
              value={draftStartDate}
              onChange={(event) => setDraftStartDate(event.target.value)}
            />
            <span style={{ color: 'var(--text-secondary)' }}>-</span>
            <Input
              type="date"
              value={draftEndDate}
              onChange={(event) => setDraftEndDate(event.target.value)}
            />
            <SegmentButton
              isActive={true}
              onClick={handleCustomDateApply}
              style={{ marginLeft: '4px' }}
            >
              Apply
            </SegmentButton>
          </CustomDateContainer>
        )}

        <ResetButton data-testid="reset-button" onClick={handleReset}>Reset</ResetButton>
      </DateControls>
    </FilterGroup>
  );

  return (
    <StyledHeader>
      <HeaderTop>
        <TitleGroup
          onClick={() => {
            const defaultRange = buildThisMonthDateRange();
            onSearchFormChange({
              chartType: 'TOP',
              strType: '1',
              ...defaultRange,
            });
          }}
          style={{ cursor: 'pointer' }}
        >
          <Title>TJMedia</Title>
          <Subtitle>Charts</Subtitle>
        </TitleGroup>
        <MobileFilterToggle data-testid="mobile-filter-toggle" onClick={() => setIsBottomSheetOpen(true)}>
          <FontAwesomeIcon icon={faFilter} />
        </MobileFilterToggle>
      </HeaderTop>

      <DesktopControls data-testid="desktop-controls">{filterControls}</DesktopControls>

      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      >
        {filterControls}
      </BottomSheet>
    </StyledHeader>
  );
}
