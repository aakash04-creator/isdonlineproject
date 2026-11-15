using UnityEngine;
using UnityEngine.SceneManagement;

namespace BoxCrafter.Core
{
    /// <summary>
    /// Manages game levels, objectives, win/lose states, and tracking score/moves.
    /// </summary>
    public class LevelManager : MonoBehaviour
    {
        public static LevelManager Instance { get; private set; }

        [Header("Level Configuration")]
        [SerializeField] private PressurePlate[] goalPlates;
        [SerializeField] private int currentLevelIndex = 1;

        private int movesCount = 0;
        private float timer = 0f;
        private bool isLevelCompleted = false;

        public int MovesCount => movesCount;
        public float ElapsedTime => timer;
        public bool IsLevelCompleted => isLevelCompleted;

        public System.Action<int> OnMovesChanged;
        public System.Action OnLevelWon;
        public System.Action OnLevelFailed;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void Start()
        {
            if (goalPlates == null || goalPlates.Length == 0)
            {
                goalPlates = FindObjectsByType<PressurePlate>(FindObjectsSortMode.None);
            }

            foreach (var plate in goalPlates)
            {
                plate.OnStateChanged += HandlePlateStateChanged;
            }

            var player = FindFirstObjectByType<PlayerController>();
            if (player != null)
            {
                player.OnRollCompleted += RecordMove;
            }
        }

        private void Update()
        {
            if (!isLevelCompleted)
            {
                timer += Time.deltaTime;
            }
        }

        private void RecordMove()
        {
            if (isLevelCompleted) return;
            movesCount++;
            OnMovesChanged?.Invoke(movesCount);
        }

        private void HandlePlateStateChanged(bool isPressed)
        {
            CheckVictoryCondition();
        }

        private void CheckVictoryCondition()
        {
            if (isLevelCompleted || goalPlates.Length == 0) return;

            bool allActive = true;
            foreach (var plate in goalPlates)
            {
                if (!plate.IsPressed)
                {
                    allActive = false;
                    break;
                }
            }

            if (allActive)
            {
                isLevelCompleted = true;
                OnLevelWon?.Invoke();
            }
        }

        public void RestartLevel()
        {
            SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        }

        public void LoadNextLevel()
        {
            int nextIndex = SceneManager.GetActiveScene().buildIndex + 1;
            if (nextIndex < SceneManager.sceneCountInBuildSettings)
            {
                SceneManager.LoadScene(nextIndex);
            }
            else
            {
                RestartLevel();
            }
        }
    }
}
