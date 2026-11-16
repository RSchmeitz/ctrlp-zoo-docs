"""Minimal EnvContext/EnvSpec example; run from the repository root."""
import gymnasium as gym
import numpy as np

from ctrlp.environments.context import EnvContext
from ctrlp.environments.spec import EnvSpec


class CounterEnv(gym.Env):
    """Choose decrement/increment until reaching a configured count."""

    metadata = {"render_modes": []}

    def __init__(self, context: EnvContext):
        self.goal = int(context.env.get("goal", 3))
        if self.goal < 1:
            raise ValueError("goal must be positive")
        self.action_space = gym.spaces.Discrete(2)
        self.observation_space = gym.spaces.Box(0, self.goal, shape=(1,), dtype=np.float32)
        self.value = 0

    def observation(self):
        return np.array([self.value], dtype=np.float32)

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        self.value = 0
        return self.observation(), {"score": 0.0}

    def step(self, action):
        if not self.action_space.contains(action):
            raise ValueError("action must be 0 or 1")
        self.value = int(np.clip(self.value + (1 if action else -1), 0, self.goal))
        done = self.value == self.goal
        return self.observation(), float(done), done, False, {"score": float(done)}


ENV_SPEC = EnvSpec(id="example/counter-v0", slug="counter", entry_point="counter_env:CounterEnv")


def get_env_specs():
    return [ENV_SPEC]


if __name__ == "__main__":
    from gymnasium.utils.env_checker import check_env
    context = EnvContext(env={"goal": 3}, reward={}, procgen={}, paths={})
    env = CounterEnv(context)
    check_env(env, skip_render_check=True)
    env.reset(seed=0)
    for _ in range(3):
        observation, reward, terminated, truncated, info = env.step(1)
    assert terminated and not truncated and reward == 1.0
    env.close()
    print("Counter environment: Gymnasium contract and completion checked")
