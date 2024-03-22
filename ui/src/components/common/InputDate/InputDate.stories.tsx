import { css } from '@emotion/react';
import { Meta, StoryObj } from '@storybook/react';
import dayjs from 'dayjs';
import { InputDate } from './InputDate';

export default {
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
      <section>
        <h2>Month</h2>
        <h3>
          <small>
            (type: <code>month</code>)
          </small>
        </h3>
        <InputDate type="month" />
      </section>
      <section>
        <h2>Week</h2>
        <h3>
          <small>
            (type: <code>week</code>)
          </small>
        </h3>
        <InputDate type="week" />
      </section>
      <section>
        <h2>Date</h2>
        <h3>
          <small>
            (type: <code>date</code>)
          </small>
        </h3>
        <InputDate type="date" />
      </section>
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
      <section>
        <h2>Month</h2>
        <h3>
          <small>
            (type: <code>month</code>)
          </small>
        </h3>
        <InputDate type="month" defaultValue={'2000-01'} />
      </section>
      <section>
        <h2>Week</h2>
        <h3>
          <small>
            (type: <code>week</code>)
          </small>
        </h3>
        <InputDate type="week" defaultValue={'2000-W01'} />
      </section>
      <section>
        <h2>Date</h2>
        <h3>
          <small>
            (type: <code>date</code>)
          </small>
        </h3>
        <InputDate type="date" defaultValue={'2000-01-01'} />
      </section>
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
      <section>
        <h2>Month</h2>
        <h3>
          <small>
            (type: <code>month</code>)
          </small>
        </h3>
        <InputDate type="month" defaultValue={dayjs()} />
      </section>
      <section>
        <h2>Week</h2>
        <h3>
          <small>
            (type: <code>week</code>)
          </small>
        </h3>
        <InputDate type="week" defaultValue={dayjs()} />
      </section>
      <section>
        <h2>Date</h2>
        <h3>
          <small>
            (type: <code>date</code>)
          </small>
        </h3>
        <InputDate type="date" defaultValue={dayjs()} />
      </section>
    </section>
  ),
};
