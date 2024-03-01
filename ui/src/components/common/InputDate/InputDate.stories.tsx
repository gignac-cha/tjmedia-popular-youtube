import { css } from '@emotion/react';
import { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { InputDate } from './InputDate';

export default {
  title: 'InputDate',
  component: InputDate,
} satisfies Meta;

export const Default: StoryObj<typeof InputDate> = {};

export const WithTypeWithEmptyDate: StoryObj<typeof InputDate> = {
  render: () => (
    <section
      css={css`
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
      `}
    >
      <p>
        <h2>Month</h2>
        <h3>
          <small>
            (type: <code>month</code>)
          </small>
        </h3>
        <InputDate type="month" />
      </p>
      <p>
        <h2>Week</h2>
        <h3>
          <small>
            (type: <code>week</code>)
          </small>
        </h3>
        <InputDate type="week" />
      </p>
      <p>
        <h2>Date</h2>
        <h3>
          <small>
            (type: <code>date</code>)
          </small>
        </h3>
        <InputDate type="date" />
      </p>
    </section>
  ),
};

export const WithTypeWithDateWithString: StoryObj<typeof InputDate> = {
  render: () => (
    <section
      css={css`
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
      `}
    >
      <p>
        <h2>Month</h2>
        <h3>
          <small>
            (type: <code>month</code>)
          </small>
        </h3>
        <InputDate type="month" value={'2000-01'} />
      </p>
      <p>
        <h2>Week</h2>
        <h3>
          <small>
            (type: <code>week</code>)
          </small>
        </h3>
        <InputDate type="week" value={'2000-W01'} />
      </p>
      <p>
        <h2>Date</h2>
        <h3>
          <small>
            (type: <code>date</code>)
          </small>
        </h3>
        <InputDate type="date" value={'2000-01-01'} />
      </p>
    </section>
  ),
};

export const WithTypeWithDateWithDayjs = {
  render: () => (
    <section
      css={css`
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
      `}
    >
      <p>
        <h2>Month</h2>
        <h3>
          <small>
            (type: <code>month</code>)
          </small>
        </h3>
        <InputDate type="month" value={dayjs()} />
      </p>
      <p>
        <h2>Week</h2>
        <h3>
          <small>
            (type: <code>week</code>)
          </small>
        </h3>
        <InputDate type="week" value={dayjs()} />
      </p>
      <p>
        <h2>Date</h2>
        <h3>
          <small>
            (type: <code>date</code>)
          </small>
        </h3>
        <InputDate type="date" value={dayjs()} />
      </p>
    </section>
  ),
};
