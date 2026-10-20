export const TRIGGER_TYPES = ['user_action'] as const;
export const USER_ACTIONS = ['signed_up', 'signed_in', 'made_purchase', 'logged_out'] as const;

export type TriggerType = (typeof TRIGGER_TYPES)[number];
export type UserAction = (typeof USER_ACTIONS)[number];

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  user_action: 'User action',
};

export const USER_ACTION_LABELS: Record<UserAction, string> = {
  signed_up: 'Signed up',
  signed_in: 'Signed in',
  made_purchase: 'Made purchase',
  logged_out: 'Logged out',
};
