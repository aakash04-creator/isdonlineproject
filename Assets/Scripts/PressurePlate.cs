using UnityEngine;

namespace BoxCrafter.Core
{
    /// <summary>
    /// Pressure plate trigger that activates when a box or player stands on it.
    /// Can toggle doors, gates, or trigger victory conditions.
    /// </summary>
    public class PressurePlate : MonoBehaviour
    {
        [Header("Plate Settings")]
        [SerializeField] private Transform plateMesh;
        [SerializeField] private float pressDepth = 0.08f;
        [SerializeField] private Color activeColor = Color.green;
        [SerializeField] private Color inactiveColor = Color.red;
        [SerializeField] private MeshRenderer indicatorRenderer;

        private int objectCountOnPlate = 0;
        private Vector3 unpressedPos;
        private Vector3 pressedPos;

        public bool IsPressed => objectCountOnPlate > 0;
        public System.Action<bool> OnStateChanged;

        private void Awake()
        {
            if (plateMesh != null)
            {
                unpressedPos = plateMesh.localPosition;
                pressedPos = unpressedPos + Vector3.down * pressDepth;
            }
            UpdateVisuals();
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player") || other.GetComponent<PushableBox>() != null)
            {
                objectCountOnPlate++;
                if (objectCountOnPlate == 1)
                {
                    UpdateVisuals();
                    OnStateChanged?.Invoke(true);
                }
            }
        }

        private void OnTriggerExit(Collider other)
        {
            if (other.CompareTag("Player") || other.GetComponent<PushableBox>() != null)
            {
                objectCountOnPlate = Mathf.Max(0, objectCountOnPlate - 1);
                if (objectCountOnPlate == 0)
                {
                    UpdateVisuals();
                    OnStateChanged?.Invoke(false);
                }
            }
        }

        private void UpdateVisuals()
        {
            if (plateMesh != null)
            {
                plateMesh.localPosition = IsPressed ? pressedPos : unpressedPos;
            }
            if (indicatorRenderer != null)
            {
                indicatorRenderer.material.color = IsPressed ? activeColor : inactiveColor;
            }
        }
    }
}

